use anchor_lang::prelude::*;

#[derive(Clone, AnchorSerialize, AnchorDeserialize, InitSpace)]
pub enum Status {
    pending,
    approved,
    rejected,
}

#[account]
#[derive(InitSpace)]
pub struct TransferRecord {
    #[max_len(36)]
    pub employee_id: String,

    pub employee_pub_key: Pubkey,

    #[max_len(36)]
    pub time_off_request_id: String,

    pub status: Status,

    pub bump_seed: u8,
}
