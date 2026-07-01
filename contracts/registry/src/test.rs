#![cfg(test)]
extern crate std;

use super::*;
use ::campaign::{Campaign, CampaignClient};
use ::treasury::{Treasury, TreasuryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_registry_create_and_list() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let registry_addr = Address::generate(&env);

    let treasury_id = env.register(Treasury, (&admin,));
    let treasury = TreasuryClient::new(&env, &treasury_id);

    let campaign_contract_id = env.register(Campaign, (&admin,));
    let campaign = CampaignClient::new(&env, &campaign_contract_id);
    treasury.set_campaign_contract(&admin, &campaign_contract_id);

    let registry_id = env.register(Registry, (&admin, &campaign_contract_id));
    campaign.set_registry(&admin, &registry_id);
    campaign.set_treasury(&registry_id, &treasury_id);

    let client = RegistryClient::new(&env, &registry_id);

    let creator = Address::generate(&env);
    let now = env.ledger().timestamp();
    let id = client.create_campaign(
        &creator,
        &String::from_str(&env, "Art Project"),
        &String::from_str(&env, "Community mural"),
        &String::from_str(&env, "ipfs://art"),
        &500,
        &(now + 5000),
        &String::from_str(&env, "Art"),
        &10,
    );

    assert_eq!(id, 1);
    assert_eq!(client.list_campaigns().len(), 1);
    assert_eq!(client.get_campaign(&id).goal, 500);
}
