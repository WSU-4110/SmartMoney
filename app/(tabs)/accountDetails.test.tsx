import { AccountRepository } from './accountDetails'; // Adjust import path accordingly

describe('AccountRepository', () => {
  let repository: AccountRepository;

  beforeEach(() => {
    // Before each test, create a fresh instance of the repository
    repository = AccountRepository.getAccountRespository();
  });

  test("should find the account", () => {
    const account = repository.getAccountById(0);
    expect(account).toBeInstanceOf(account);

  });



  test("Should create a new account", () => {
    const account = AccountRepository.getAccountRespository();    
    expect(account).toBeDefined(); 
    expect(account).toBeInstanceOf(AccountRepository); 
    });
});
