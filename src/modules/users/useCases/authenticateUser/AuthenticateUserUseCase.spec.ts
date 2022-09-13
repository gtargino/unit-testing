import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';

import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able to authenticate an user", async() => {
        await createUserUseCase.execute({
            name: "User",
            email: "authtest@authtest.com",
            password: "12345"
        });

        const authResult = await authenticateUserUseCase.execute({
            email: "authtest@authtest.com",
            password: "12345"
        });
        expect(authResult).toHaveProperty("token");
    });

    it("shouldn't be able to authenticate a nonexistent user", async() => {
        expect(async () => {
            await authenticateUserUseCase.execute({
                email: "false@email",
                password: "4321"
            });
        }).rejects.toBeInstanceOf(AppError);
    });

    it("shouldn't be able to authenticate with invalid credentials", async() => {
        expect(async () => {
            const user = {
                name: "User",
                email: "authtest@authtest.com",
                password: "12345"
            };
            await createUserUseCase.execute(user);
            
            await authenticateUserUseCase.execute({
                email: user.email,
                password: 'invalidpass123'
            });
        }).rejects.toBeInstanceOf(AppError);
    });
});