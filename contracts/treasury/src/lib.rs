#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error,
    Address, Env,
};

#[contract]
pub struct Treasury;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    CampaignContract,
    Registry,
    Total(u32),
    Contribution(u32, Address),
    Refunded(u32, Address),
    Withdrawn(u32),
}

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum CampaignStatus {
    Active = 0,
    Succeeded = 1,
    Failed = 2,
    Cancelled = 3,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    Unauthorized = 1,
    InvalidAmount = 2,
    AlreadyWithdrawn = 3,
    AlreadyRefunded = 4,
    InsufficientBalance = 5,
    CampaignNotFound = 6,
}

#[contractevent]
#[derive(Clone)]
pub struct ContributionReceived {
    pub campaign_id: u32,
    pub contributor: Address,
    pub amount: i128,
    pub total_raised: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct FundsWithdrawn {
    pub campaign_id: u32,
    pub creator: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone)]
pub struct RefundIssued {
    pub campaign_id: u32,
    pub contributor: Address,
    pub amount: i128,
}

#[contractimpl]
impl Treasury {
    pub fn __constructor(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn set_campaign_contract(env: Env, admin: Address, campaign: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::CampaignContract, &campaign);
    }

    pub fn set_registry(env: Env, admin: Address, registry: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        env.storage().instance().set(&DataKey::Registry, &registry);
    }

    fn require_admin(env: &Env, admin: &Address) {
        let stored: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("admin");
        if *admin != stored {
            panic_with_error!(env, Error::Unauthorized);
        }
    }

    fn require_campaign(env: &Env) {
        let campaign: Address = env
            .storage()
            .instance()
            .get(&DataKey::CampaignContract)
            .expect("campaign");
        campaign.require_auth();
    }

    pub fn init_campaign(env: Env, campaign_id: u32) {
        Self::require_campaign(&env);
        let key = DataKey::Total(campaign_id);
        if !env.storage().persistent().has(&key) {
            env.storage().persistent().set(&key, &0_i128);
        }
    }

    pub fn record_deposit(
        env: Env,
        campaign_id: u32,
        contributor: Address,
        amount: i128,
    ) -> i128 {
        Self::require_campaign(&env);
        if amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }

        let total_key = DataKey::Total(campaign_id);
        if !env.storage().persistent().has(&total_key) {
            panic_with_error!(&env, Error::CampaignNotFound);
        }

        let contrib_key = DataKey::Contribution(campaign_id, contributor.clone());
        let prev: i128 = env.storage().persistent().get(&contrib_key).unwrap_or(0);
        let new_contrib = prev.checked_add(amount).unwrap_or_else(|| panic_with_error!(&env, Error::InvalidAmount));
        env.storage().persistent().set(&contrib_key, &new_contrib);

        let total: i128 = env.storage().persistent().get(&total_key).unwrap_or(0);
        let new_total = total.checked_add(amount).unwrap_or_else(|| panic_with_error!(&env, Error::InvalidAmount));
        env.storage().persistent().set(&total_key, &new_total);

        ContributionReceived {
            campaign_id,
            contributor: contributor.clone(),
            amount,
            total_raised: new_total,
        }
        .publish(&env);

        new_total
    }

    pub fn release_to_creator(env: Env, campaign_id: u32, creator: Address, amount: i128) {
        Self::require_campaign(&env);
        if amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }
        if env.storage().persistent().has(&DataKey::Withdrawn(campaign_id)) {
            panic_with_error!(&env, Error::AlreadyWithdrawn);
        }

        let total_key = DataKey::Total(campaign_id);
        let total: i128 = env.storage().persistent().get(&total_key).unwrap_or(0);
        if amount > total {
            panic_with_error!(&env, Error::InsufficientBalance);
        }

        env.storage().persistent().set(&DataKey::Withdrawn(campaign_id), &true);
        FundsWithdrawn {
            campaign_id,
            creator: creator.clone(),
            amount,
        }
        .publish(&env);
    }

    pub fn mark_refunded(env: Env, campaign_id: u32, contributor: Address, amount: i128) {
        Self::require_campaign(&env);
        if amount <= 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }

        let refund_key = DataKey::Refunded(campaign_id, contributor.clone());
        if env.storage().persistent().has(&refund_key) {
            panic_with_error!(&env, Error::AlreadyRefunded);
        }

        let contrib_key = DataKey::Contribution(campaign_id, contributor.clone());
        let contributed: i128 = env.storage().persistent().get(&contrib_key).unwrap_or(0);
        if contributed < amount {
            panic_with_error!(&env, Error::InsufficientBalance);
        }

        env.storage().persistent().set(&refund_key, &true);
        RefundIssued {
            campaign_id,
            contributor,
            amount,
        }
        .publish(&env);
    }

    pub fn get_campaign_total(env: Env, campaign_id: u32) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Total(campaign_id))
            .unwrap_or(0)
    }

    pub fn get_contribution(env: Env, campaign_id: u32, contributor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(campaign_id, contributor))
            .unwrap_or(0)
    }

    pub fn is_withdrawn(env: Env, campaign_id: u32) -> bool {
        env.storage().persistent().has(&DataKey::Withdrawn(campaign_id))
    }

    pub fn is_refunded(env: Env, campaign_id: u32, contributor: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Refunded(campaign_id, contributor))
    }
}

#[cfg(test)]
mod test;
