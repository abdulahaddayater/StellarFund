#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_record_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let campaign = Address::generate(&env);
    let contributor = Address::generate(&env);

    let id = env.register(Treasury, (&admin,));
    let client = TreasuryClient::new(&env, &id);
    client.set_campaign_contract(&admin, &campaign);
    client.init_campaign(&1);

    let total = client.record_deposit(&1, &contributor, &100);
    assert_eq!(total, 100);
    assert_eq!(client.get_contribution(&1, &contributor), 100);
    assert_eq!(client.get_campaign_total(&1), 100);
}

#[test]
fn test_duplicate_refund_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let campaign = Address::generate(&env);
    let contributor = Address::generate(&env);

    let id = env.register(Treasury, (&admin,));
    let client = TreasuryClient::new(&env, &id);
    client.set_campaign_contract(&admin, &campaign);
    client.init_campaign(&1);
    client.record_deposit(&1, &contributor, &50);
    client.mark_refunded(&1, &contributor, &50);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_cannot_refund_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let campaign = Address::generate(&env);
    let contributor = Address::generate(&env);

    let id = env.register(Treasury, (&admin,));
    let client = TreasuryClient::new(&env, &id);
    client.set_campaign_contract(&admin, &campaign);
    client.init_campaign(&1);
    client.record_deposit(&1, &contributor, &50);
    client.mark_refunded(&1, &contributor, &50);
    client.mark_refunded(&1, &contributor, &50);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_cannot_withdraw_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let campaign = Address::generate(&env);
    let creator = Address::generate(&env);

    let id = env.register(Treasury, (&admin,));
    let client = TreasuryClient::new(&env, &id);
    client.set_campaign_contract(&admin, &campaign);
    client.init_campaign(&1);
    client.record_deposit(&1, &creator, &100);
    client.release_to_creator(&1, &creator, &100);
    client.release_to_creator(&1, &creator, &100);
}
