import "reflect-metadata";

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { AppError } from "../../../../shared/errors/AppError";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

const user = {
    name: "TestUser",
    email: "testuser@testuser.com",
    password: "12345678910"
};

let userAuth;
let user_id: string;

describe("Create Statement", () => {
    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);

        await createUserUseCase.execute(user);

        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        
        userAuth = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        user_id = userAuth.user.id as string;

    });
    
    it("Should be able to deposit", async () => {
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        
        const statement = await createStatementUseCase.execute({
            'user_id': user_id,
            'type': OperationType.DEPOSIT,
            'amount': 100,
            'description': "Deposit Test"
        });
        
        expect(statement).toHaveProperty("id");

    });

    it("Should be able to withdraw", async () => {
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        
        const amout_value = [100, 50];

        await createStatementUseCase.execute({
            'user_id': user_id,
            'type': OperationType.DEPOSIT,
            'amount': amout_value[0],
            'description': "Deposit Test"
        });

        const statement = await createStatementUseCase.execute({
            'user_id': user_id,
            'type': OperationType.WITHDRAW,
            'amount': amout_value[1],
            'description': "Withdraw Test"
        });

        expect(statement).toHaveProperty("id");
        expect(statement.amount).toBe(amout_value[0] - amout_value[1]);

    });

    it("Shouldn't be able to withdraw with no funds", async () => {
        expect(async () => {
            enum OperationType {
                DEPOSIT = 'deposit',
                WITHDRAW = 'withdraw',
            }
            
            await createStatementUseCase.execute({
                'user_id': user_id,
                'type': OperationType.WITHDRAW,
                'amount': 100,
                'description': "Withdraw Test"
            });
        }).rejects.toBeInstanceOf(AppError);

    });

});