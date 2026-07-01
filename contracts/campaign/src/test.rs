#![cfg(test)]
extern crate std;

use super::*;
use ::treasury::{Treasury, TreasuryClient};
use ::registry::{Registry, RegistryClient};
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, Env, String};

fn setup(env: &Env) -> (Address, Address, Address, Address, CampaignClient<'static>, TreasuryClient<'static>) {
    env.mock_all_auths();
    let admin = Address::generate(env);

    let treasury_id = env.register(Treasury, (&admin,));
    let treasury_client = TreasuryClient::new(env, &treasury_id);

    let campaign_id = env.register(Campaign, (&admin,));
    let campaign_client = CampaignClient::new(env, &campaign_id);

    let registry_id = env.register(Registry, (&admin, &campaign_id));
    treasury_client.set_campaign_contract(&admin, &campaign_id);
    campaign_client.set_registry(&admin, &registry_id);
    campaign_client.set_treasury(&registry_id, &treasury_id);

    (admin, registry_id, treasury_id, campaign_id, campaign_client, treasury_client)
}

fn create_sample(
    client: &CampaignClient,
    registry: &Address,
    creator: &Address,
    goal: i128,
    deadline_offset: u64,
) -> u32 {
    let env = &client.env;
    let now = env.ledger().timestamp();
    client.create_campaign(
        registry,
        creator,
        &String::from_str(&env, "Solar Panels"),
        &String::from_str(&env, "Clean energy for schools"),
        &String::from_str(&env, "ipfs://img"),
        &goal,
        &(now + deadline_offset),
        &String::from_str(&env, "Technology"),
        &10,
    )
}

#[test]
fn test_create_campaign() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    assert_eq!(id, 1);
    let c = client.get_campaign(&id);
    assert_eq!(c.goal, 1000);
    assert_eq!(c.status, STATUS_ACTIVE);
}

#[test]
fn test_contribute() {
    let env = Env::default();
    let (_, registry, _, _, client, treasury) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.contribute(&registry, &id, &backer, &100);
    assert_eq!(client.get_balance(&id), 100);
    assert_eq!(client.get_contributors(&id), 1);
    assert_eq!(treasury.get_contribution(&id, &backer), 100);
}

#[test]
fn test_multiple_contributors() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let b1 = Address::generate(&env);
    let b2 = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.contribute(&registry, &id, &b1, &50);
    client.contribute(&registry, &id, &b2, &75);
    client.contribute(&registry, &id, &b1, &25);
    assert_eq!(client.get_contributors(&id), 2);
    assert_eq!(client.get_balance(&id), 150);
}

#[test]
fn test_goal_reached() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 100, 86400);
    client.contribute(&registry, &id, &backer, &100);
    let c = client.get_campaign(&id);
    assert_eq!(c.status, STATUS_SUCCEEDED);
    assert_eq!(c.raised, 100);
}

#[test]
fn test_withdraw_after_success() {
    let env = Env::default();
    let (_, registry, _, _, client, treasury) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 100, 86400);
    client.contribute(&registry, &id, &backer, &100);
    client.withdraw(&registry, &id, &creator);
    assert!(treasury.is_withdrawn(&id));
    assert!(client.get_campaign(&id).withdrawn);
}

#[test]
fn test_failed_campaign_refund() {
    let env = Env::default();
    let (_, registry, _, _, client, treasury) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 100);
    client.contribute(&registry, &id, &backer, &50);
    env.ledger().set_timestamp(env.ledger().timestamp() + 200);
    client.refund(&registry, &id, &backer);
    assert!(treasury.is_refunded(&id, &backer));
}

#[test]
#[should_panic(expected = "Error(Contract, #9)")]
fn test_creator_cannot_contribute() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.contribute(&registry, &id, &creator, &50);
}

#[test]
#[should_panic(expected = "Error(Contract, #8)")]
fn test_below_minimum_contribution() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.contribute(&registry, &id, &backer, &5);
}

#[test]
#[should_panic(expected = "Error(Contract, #11)")]
fn test_invalid_withdraw_before_goal() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.contribute(&registry, &id, &backer, &50);
    client.withdraw(&registry, &id, &creator);
}

#[test]
#[should_panic(expected = "Error(Contract, #14)")]
fn test_invalid_refund_on_active_campaign() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.contribute(&registry, &id, &backer, &50);
    client.refund(&registry, &id, &backer);
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn test_expired_campaign_contribution() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let backer = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 100);
    env.ledger().set_timestamp(env.ledger().timestamp() + 200);
    client.contribute(&registry, &id, &backer, &50);
}

#[test]
fn test_list_campaigns() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    create_sample(&client, &registry, &creator, 100, 86400);
    create_sample(&client, &registry, &creator, 200, 86400);
    let ids = client.list_campaigns();
    assert_eq!(ids.len(), 2);
}

#[test]
fn test_cancel_campaign() {
    let env = Env::default();
    let (_, registry, _, _, client, _) = setup(&env);
    let creator = Address::generate(&env);
    let id = create_sample(&client, &registry, &creator, 1000, 86400);
    client.cancel_campaign(&registry, &id, &creator);
    assert_eq!(client.get_campaign(&id).status, STATUS_CANCELLED);
}
