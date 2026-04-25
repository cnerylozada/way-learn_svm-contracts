use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateRecord<'info> {
    #[account(mut)]
    signer: Signer<'info>,
}

pub fn update_record(_ctx: Context<UpdateRecord>) -> Result<()> {
    Ok(())
}
