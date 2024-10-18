const bankCommand = (bank) => {
  return {
    proof_number: bank.proof_number,
    account_id: bank.account.id,
    opposition_account_id: bank.opposition_account.id,
    date_proposed: bank.date_proposed,
    description: bank.description,
    debit: bank.debit,
    credit: bank.credit,
    cash_type_id: bank.cash_type_id,
  };
};

module.exports = { bankCommand };
