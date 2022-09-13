import "reflect-metadata";

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from '../../../statements/useCases/getBalance/GetBalanceUseCase';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let user = {
    name: "UserTest",
    email: "test@test.com",
    password: "12345"
};

let userAuth;

describe('Get User Balance', () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    });
    
    it("Should be able to get the current balance", async () => {
        await createUserUseCase.execute(user);


        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);

        userAuth = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        if (userAuth) {
            type IRequest = {
                user_id: string;
            };

            let userAuthAsIReq = userAuth as unknown as IRequest;
            userAuthAsIReq.user_id = userAuth.user.id as string;

            const balance = await getBalanceUseCase.execute(userAuthAsIReq);
            expect(balance).toHaveProperty("balance");
            expect(balance).toHaveProperty("statement");
        }
    });
});