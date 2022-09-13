import "reflect-metadata";

import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Show User Profile", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    });
    it("Given the token, should be able to show user's profile", async () => {
        const user = {
            name: "UserTest",
            email: "test@test.com",
            password: "12345"
        };

        await createUserUseCase.execute(user);

        const userAuth = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        if (userAuth) {
            const profile = await showUserProfileUseCase.execute(userAuth.user.id as string);
            expect(profile).toHaveProperty("email");
        }
    });
})