#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env, String, Vec};

mod campaign {
    soroban_sdk::contractimport!(
        file = "../target/wasm32v1-none/release/campaign.wasm"
    );
}

#[contract]
pub struct Registry;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    Unauthorized = 1,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    CampaignContract,
}

#[contractimpl]
impl Registry {
    pub fn __constructor(env: Env, admin: Address, campaign: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CampaignContract, &campaign);
    }

    fn campaign_client(env: &Env) -> campaign::Client<'_> {
        let addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::CampaignContract)
            .expect("campaign");
        campaign::Client::new(env, &addr)
    }

    fn registry_addr(env: &Env) -> Address {
        env.current_contract_address()
    }

    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        image: String,
        goal: i128,
        deadline: u64,
        category: String,
        min_contribution: i128,
    ) -> u32 {
        creator.require_auth();
        Self::campaign_client(&env).create_campaign(
            &Self::registry_addr(&env),
            &creator,
            &title,
            &description,
            &image,
            &goal,
            &deadline,
            &category,
            &min_contribution,
        )
    }

    pub fn get_campaign(env: Env, campaign_id: u32) -> campaign::CampaignData {
        Self::campaign_client(&env).get_campaign(&campaign_id)
    }

    pub fn list_campaigns(env: Env) -> Vec<u32> {
        Self::campaign_client(&env).list_campaigns()
    }

    pub fn contribute(env: Env, campaign_id: u32, contributor: Address, amount: i128) {
        contributor.require_auth();
        Self::campaign_client(&env).contribute(
            &Self::registry_addr(&env),
            &campaign_id,
            &contributor,
            &amount,
        );
    }

    pub fn withdraw(env: Env, campaign_id: u32, creator: Address) {
        creator.require_auth();
        Self::campaign_client(&env).withdraw(
            &Self::registry_addr(&env),
            &campaign_id,
            &creator,
        );
    }

    pub fn refund(env: Env, campaign_id: u32, contributor: Address) {
        contributor.require_auth();
        Self::campaign_client(&env).refund(
            &Self::registry_addr(&env),
            &campaign_id,
            &contributor,
        );
    }

    pub fn cancel_campaign(env: Env, campaign_id: u32, creator: Address) {
        creator.require_auth();
        Self::campaign_client(&env).cancel_campaign(
            &Self::registry_addr(&env),
            &campaign_id,
            &creator,
        );
    }

    pub fn get_contributors(env: Env, campaign_id: u32) -> u32 {
        Self::campaign_client(&env).get_contributors(&campaign_id)
    }

    pub fn get_balance(env: Env, campaign_id: u32) -> i128 {
        Self::campaign_client(&env).get_balance(&campaign_id)
    }

    pub fn initialize_treasury(env: Env, admin: Address, treasury: Address) {
        admin.require_auth();
        let stored: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("admin");
        if admin != stored {
            panic_with_error!(&env, Error::Unauthorized);
        }
        Self::campaign_client(&env).set_treasury(&Self::registry_addr(&env), &treasury);
    }
}

#[cfg(test)]
mod test;
