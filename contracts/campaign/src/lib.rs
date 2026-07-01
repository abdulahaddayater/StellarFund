#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error,
    symbol_short, Address, Env, String, Vec,
};

mod treasury {
    soroban_sdk::contractimport!(
        file = "../target/wasm32v1-none/release/treasury.wasm"
    );
}

#[contract]
pub struct Campaign;

#[contracttype]
#[derive(Clone)]
pub struct CampaignData {
    pub id: u32,
    pub creator: Address,
    pub goal: i128,
    pub raised: i128,
    pub deadline: u64,
    pub category: String,
    pub image: String,
    pub title: String,
    pub description: String,
    pub min_contribution: i128,
    pub contributor_count: u32,
    pub status: u32,
    pub withdrawn: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Campaign(u32),
    Contributor(u32, Address),
    Registry,
    Treasury,
    BootstrapAdmin,
    NextId,
    CampaignIds,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    Unauthorized = 1,
    InvalidGoal = 2,
    InvalidDeadline = 3,
    InvalidMinContribution = 4,
    CampaignNotFound = 5,
    CampaignNotActive = 6,
    DeadlinePassed = 7,
    BelowMinimum = 8,
    CreatorCannotContribute = 9,
    GoalNotReached = 10,
    DeadlineNotPassed = 11,
    AlreadyWithdrawn = 12,
    CampaignSucceeded = 13,
    CampaignNotFailed = 14,
    AlreadyRefunded = 15,
    NothingToRefund = 16,
    InvalidTitle = 17,
    AlreadyCancelled = 18,
}

pub const STATUS_ACTIVE: u32 = 0;
pub const STATUS_SUCCEEDED: u32 = 1;
pub const STATUS_FAILED: u32 = 2;
pub const STATUS_CANCELLED: u32 = 3;

#[contractevent]
#[derive(Clone)]
pub struct CampaignCreated {
    pub id: u32,
    pub creator: Address,
    pub goal: i128,
    pub deadline: u64,
}

#[contractevent]
#[derive(Clone)]
pub struct GoalReached {
    pub campaign_id: u32,
    pub raised: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct CampaignSucceeded {
    pub campaign_id: u32,
}

#[contractevent]
#[derive(Clone)]
pub struct CampaignFailed {
    pub campaign_id: u32,
}

#[contractevent]
#[derive(Clone)]
pub struct CampaignCancelled {
    pub campaign_id: u32,
}

#[contractimpl]
impl Campaign {
    pub fn __constructor(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::BootstrapAdmin, &admin);
        env.storage().instance().set(&DataKey::Registry, &admin);
        env.storage().instance().set(&DataKey::NextId, &0_u32);
        env.storage().instance().set(&DataKey::CampaignIds, &Vec::<u32>::new(&env));
    }

    pub fn set_registry(env: Env, admin: Address, registry: Address) {
        admin.require_auth();
        let bootstrap: Address = env
            .storage()
            .instance()
            .get(&DataKey::BootstrapAdmin)
            .expect("bootstrap");
        if admin != bootstrap {
            panic_with_error!(&env, Error::Unauthorized);
        }
        env.storage().instance().set(&DataKey::Registry, &registry);
    }

    pub fn set_treasury(env: Env, registry: Address, treasury: Address) {
        registry.require_auth();
        Self::require_registry(&env, &registry);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
    }

    fn require_registry(env: &Env, caller: &Address) {
        let registry: Address = env
            .storage()
            .instance()
            .get(&DataKey::Registry)
            .expect("registry");
        if *caller != registry {
            panic_with_error!(env, Error::Unauthorized);
        }
    }

    pub fn create_campaign(
        env: Env,
        registry: Address,
        creator: Address,
        title: String,
        description: String,
        image: String,
        goal: i128,
        deadline: u64,
        category: String,
        min_contribution: i128,
    ) -> u32 {
        registry.require_auth();
        Self::require_registry(&env, &registry);

        if goal <= 0 {
            panic_with_error!(&env, Error::InvalidGoal);
        }
        if min_contribution <= 0 || min_contribution > goal {
            panic_with_error!(&env, Error::InvalidMinContribution);
        }
        if title.is_empty() {
            panic_with_error!(&env, Error::InvalidTitle);
        }
        let now = env.ledger().timestamp();
        if deadline <= now {
            panic_with_error!(&env, Error::InvalidDeadline);
        }

        let mut next: u32 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        next += 1;

        let treasury: Address = env
            .storage()
            .instance()
            .get(&DataKey::Treasury)
            .expect("treasury");
        treasury::Client::new(&env, &treasury).init_campaign(&next);

        let campaign = CampaignData {
            id: next,
            creator: creator.clone(),
            goal,
            raised: 0,
            deadline,
            category,
            image,
            title,
            description,
            min_contribution,
            contributor_count: 0,
            status: STATUS_ACTIVE,
            withdrawn: false,
        };

        env.storage().persistent().set(&DataKey::Campaign(next), &campaign);
        env.storage().instance().set(&DataKey::NextId, &next);

        let mut ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::CampaignIds)
            .unwrap_or(Vec::new(&env));
        ids.push_back(next);
        env.storage().instance().set(&DataKey::CampaignIds, &ids);

        CampaignCreated {
            id: next,
            creator,
            goal,
            deadline,
        }
        .publish(&env);

        next
    }

    pub fn get_campaign(env: Env, campaign_id: u32) -> CampaignData {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::CampaignNotFound))
    }

    pub fn list_campaigns(env: Env) -> Vec<u32> {
        env.storage()
            .instance()
            .get(&DataKey::CampaignIds)
            .unwrap_or(Vec::new(&env))
    }

    fn load_campaign(env: &Env, campaign_id: u32) -> CampaignData {
        env.storage()
            .persistent()
            .get(&DataKey::Campaign(campaign_id))
            .unwrap_or_else(|| panic_with_error!(env, Error::CampaignNotFound))
    }

    fn save_campaign(env: &Env, campaign: &CampaignData) {
        env.storage()
            .persistent()
            .set(&DataKey::Campaign(campaign.id), campaign);
    }

    fn refresh_status(env: &Env, campaign: &mut CampaignData) {
        if campaign.status == STATUS_CANCELLED {
            return;
        }
        let now = env.ledger().timestamp();
        if campaign.raised >= campaign.goal && campaign.status == STATUS_ACTIVE {
            campaign.status = STATUS_SUCCEEDED;
            CampaignSucceeded {
                campaign_id: campaign.id,
            }
            .publish(env);
        } else if now > campaign.deadline && campaign.raised < campaign.goal && campaign.status == STATUS_ACTIVE {
            campaign.status = STATUS_FAILED;
            CampaignFailed {
                campaign_id: campaign.id,
            }
            .publish(env);
        }
    }

    pub fn contribute(env: Env, registry: Address, campaign_id: u32, contributor: Address, amount: i128) {
        registry.require_auth();
        Self::require_registry(&env, &registry);

        if amount <= 0 {
            panic_with_error!(&env, Error::BelowMinimum);
        }

        let mut campaign = Self::load_campaign(&env, campaign_id);
        if campaign.status != STATUS_ACTIVE {
            panic_with_error!(&env, Error::CampaignNotActive);
        }
        let now = env.ledger().timestamp();
        if now > campaign.deadline {
            panic_with_error!(&env, Error::DeadlinePassed);
        }
        if amount < campaign.min_contribution {
            panic_with_error!(&env, Error::BelowMinimum);
        }
        if contributor == campaign.creator {
            panic_with_error!(&env, Error::CreatorCannotContribute);
        }

        let treasury_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Treasury)
            .expect("treasury");

        let treasury = treasury::Client::new(&env, &treasury_addr);
        let new_total = treasury.record_deposit(&campaign_id, &contributor, &amount);

        let contrib_key = DataKey::Contributor(campaign_id, contributor.clone());
        let first_time = !env.storage().persistent().has(&contrib_key);
        env.storage().persistent().set(&contrib_key, &true);
        if first_time {
            campaign.contributor_count += 1;
        }

        campaign.raised = new_total;
        if campaign.raised >= campaign.goal {
            GoalReached {
                campaign_id,
                raised: campaign.raised,
            }
            .publish(&env);
            campaign.status = STATUS_SUCCEEDED;
            CampaignSucceeded {
                campaign_id,
            }
            .publish(&env);
        }

        Self::save_campaign(&env, &campaign);
    }

    pub fn withdraw(env: Env, registry: Address, campaign_id: u32, creator: Address) {
        registry.require_auth();
        Self::require_registry(&env, &registry);

        let mut campaign = Self::load_campaign(&env, campaign_id);
        if creator != campaign.creator {
            panic_with_error!(&env, Error::Unauthorized);
        }
        Self::refresh_status(&env, &mut campaign);

        let now = env.ledger().timestamp();
        if now <= campaign.deadline && campaign.raised < campaign.goal {
            panic_with_error!(&env, Error::DeadlineNotPassed);
        }
        if campaign.raised < campaign.goal {
            panic_with_error!(&env, Error::GoalNotReached);
        }
        if campaign.withdrawn {
            panic_with_error!(&env, Error::AlreadyWithdrawn);
        }

        let treasury_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Treasury)
            .expect("treasury");
        treasury::Client::new(&env, &treasury_addr).release_to_creator(
            &campaign_id,
            &creator,
            &campaign.raised,
        );

        campaign.withdrawn = true;
        campaign.status = STATUS_SUCCEEDED;
        Self::save_campaign(&env, &campaign);
    }

    pub fn refund(env: Env, registry: Address, campaign_id: u32, contributor: Address) {
        registry.require_auth();
        Self::require_registry(&env, &registry);

        let mut campaign = Self::load_campaign(&env, campaign_id);
        Self::refresh_status(&env, &mut campaign);
        Self::save_campaign(&env, &campaign);

        if campaign.status != STATUS_FAILED && campaign.status != STATUS_CANCELLED {
            panic_with_error!(&env, Error::CampaignNotFailed);
        }

        let treasury_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Treasury)
            .expect("treasury");
        let treasury = treasury::Client::new(&env, &treasury_addr);
        let amount = treasury.get_contribution(&campaign_id, &contributor);
        if amount <= 0 {
            panic_with_error!(&env, Error::NothingToRefund);
        }
        if treasury.is_refunded(&campaign_id, &contributor) {
            panic_with_error!(&env, Error::AlreadyRefunded);
        }

        treasury.mark_refunded(&campaign_id, &contributor, &amount);
    }

    pub fn cancel_campaign(env: Env, registry: Address, campaign_id: u32, creator: Address) {
        registry.require_auth();
        Self::require_registry(&env, &registry);

        let mut campaign = Self::load_campaign(&env, campaign_id);
        if creator != campaign.creator {
            panic_with_error!(&env, Error::Unauthorized);
        }
        if campaign.status == STATUS_CANCELLED {
            panic_with_error!(&env, Error::AlreadyCancelled);
        }
        if campaign.status != STATUS_ACTIVE {
            panic_with_error!(&env, Error::CampaignNotActive);
        }

        campaign.status = STATUS_CANCELLED;
        Self::save_campaign(&env, &campaign);
        CampaignCancelled { campaign_id }.publish(&env);
    }

    pub fn get_contributors(env: Env, campaign_id: u32) -> u32 {
        Self::load_campaign(&env, campaign_id).contributor_count
    }

    pub fn get_balance(env: Env, campaign_id: u32) -> i128 {
        Self::load_campaign(&env, campaign_id).raised
    }

    pub fn has_contributed(env: Env, campaign_id: u32, contributor: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Contributor(campaign_id, contributor))
    }
}

#[cfg(test)]
mod test;
