export interface IReadyCookToOrderUseCase {
    execute(id: string): Promise<void>;
}
