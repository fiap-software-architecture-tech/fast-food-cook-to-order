export interface IStartCookToOrderUseCase {
    execute(id: string): Promise<void>;
}
