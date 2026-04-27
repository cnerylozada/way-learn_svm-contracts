use anchor_lang::prelude::*;
mod errors;
mod instructions;
mod models;
mod utils;

use instructions::*;
use models::Status;

declare_id!("6PTXqpEACAFKJjJKh8eR6dsGMs3xH6FrC3aXZ7Qm5KqY");

#[program]
pub mod time_off_request {

    use super::*;

    pub fn set_admin(_ctx: Context<SetAdmin>) -> Result<()> {
        instructions::set_admin(_ctx)
    }

    pub fn create_record(
        _ctx: Context<CreateRecord>,
        _hash: [u8; 32],
        _time_off_request_id: String,
        _employee_id: String,
    ) -> Result<()> {
        instructions::create_record(_ctx, _hash, _time_off_request_id, _employee_id)
    }

    pub fn update_record(
        _ctx: Context<UpdateRecord>,
        _hash: [u8; 32],
        _status: Status,
    ) -> Result<()> {
        instructions::update_record(_ctx, _hash, _status)
    }
}
