import "reflect-metadata";

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { AppError } from "../../../../shared/errors/AppError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

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

        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        
        userAuth = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        user_id = userAuth.user.id as string;

    });
    
    it("Should be able to get a statement operation", async () => {
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        
        const operation = await createStatementUseCase.execute({
            'user_id': user_id,
            'type': OperationType.DEPOSIT,
            'amount': 100,
            'description': "Deposit Test"
        });

        const userStatement = {
            user_id: user_id,
            statement_id: operation.id as string
        };

        const statement = await getStatementOperationUseCase.execute(userStatement);
        
        expect(statement).toHaveProperty("id");
        expect(statement.id).toBe(userStatement.statement_id);
        expect(statement.user_id).toBe(userStatement.user_id);
        

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