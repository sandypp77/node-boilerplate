const bankDTO = (bank) => {
  return {
    id: bank.id,
    proof_number: bank.proof_number,
    opposition_coa: bank.opposition_account.coa,
    opposition_account: bank.opposition_account.name,
    opposition_account_id: bank.opposition_account.id,
    date_proposed: bank.date_proposed,
    description: bank.description,
    debit: bank.debit,
    credit: bank.credit,
    account_id: bank.account.id,
    coa: bank.account.coa,
    account: bank.account.name,
  };
};

module.exports = { bankDTO };
