use crate::models::{Status, TransferRecord};
use crate::utils::ACCOUNT_DISCRIMINATOR;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(_hash: [u8; 32],)]
pub struct CreateRecord<'info> {
    #[account(init, payer = signer,
        space = ACCOUNT_DISCRIMINATOR + TransferRecord::INIT_SPACE,
        seeds = [b"transfer_record", _hash.as_ref(), ],
        bump
    )]
    record_account: Account<'info, TransferRecord>,

    #[account(mut)]
    signer: Signer<'info>,

    system_program: Program<'info, System>,
}

pub fn create_record(
    _ctx: Context<CreateRecord>,
    _hash: [u8; 32],
    _time_off_request_id: String,
    _employee_id: String,
) -> Result<()> {
    let record = &mut _ctx.accounts.record_account;

    record.time_off_request_id = _time_off_request_id;
    record.employee_pub_key = _ctx.accounts.signer.key();
    record.employee_id = _employee_id;
    record.status = Status::pending;
    record.bump_seed = _ctx.bumps.record_account;

    Ok(())
}
