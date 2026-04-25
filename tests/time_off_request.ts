import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeOffRequest } from "../target/types/time_off_request";
import * as crypto from "crypto";
import assert from "assert";

describe("TimeOffRequest", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeOffRequest as Program<TimeOffRequest>;
  const wallet = provider.wallet as anchor.Wallet;

  const TRANSFER_RECORD_TAG = Buffer.from("transfer_record");

  describe("create_record method", () => {
    it("should create a new account", async () => {
      const _time_off_request_id = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
      const _employee_id = "eefd7a15-d16e-4273-b501-58392365240b";
      const _hash = crypto
        .createHash("sha256")
        .update(`${_time_off_request_id}${_employee_id}`)
        .digest();

      await program.methods
        .createRecord(Array.from(_hash), _time_off_request_id, _employee_id)
        .rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TRANSFER_RECORD_TAG, _hash],
        program.programId,
      );
      const record_account = await program.account.transferRecord.fetch(
        record_account_pda,
      );

      assert(record_account.timeOffRequestId === _time_off_request_id);
      assert(record_account.employeeId === _employee_id);
      assert(
        record_account.employeePubKey.toString() ===
          wallet.publicKey.toString(),
      );
    });
  });

  describe("update_record method", () => {
    it("should update the status", async () => {
      const _time_off_request_id = "589bb179-18bd-4f99-9dcc-123d114c3e6f";
      const _employee_id = "eefd7a15-d16e-4273-b501-58392365240b";
      const _hash = crypto
        .createHash("sha256")
        .update(`${_time_off_request_id}${_employee_id}`)
        .digest();

      await program.methods
        .updateRecord(Array.from(_hash), { approved: {} })
        .rpc();

      const [record_account_pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [TRANSFER_RECORD_TAG, _hash],
        program.programId,
      );

      const record_account = await program.account.transferRecord.fetch(
        record_account_pda,
      );

      assert(record_account.timeOffRequestId === _time_off_request_id);
      assert(Object.keys(record_account.status)[0] === "approved");
    });
  });
});
