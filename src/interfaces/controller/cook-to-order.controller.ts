import { inject, injectable } from 'inversify';

import { ICreateCookToOrderUseCase } from '#/application/use-cases/cook-to-order/create-cook-to-order/create-cook-to-order.use-case';
import { IListCookToOrderUseCase } from '#/application/use-cases/cook-to-order/list-cook-to-order/list-cook-to-order.use-case';
import { IReadyCookToOrderUseCase } from '#/application/use-cases/cook-to-order/ready-cook-to-order/ready-cook-to-order.use-case';
import { IStartCookToOrderUseCase } from '#/application/use-cases/cook-to-order/start-cook-to-order/start-cook-to-order.use-case';
import { CookToOrderStatus } from '#/domain/enum/cook-to-order-status';
import { ILogger } from '#/domain/services/logger.service';
import { TYPES } from '#/infrastructure/config/di/types';
import { CookToOrderCreateRequest } from '#/interfaces/http/schemas/cook-to-order/cook-to-order-request.schema';
import { CookToOrderResponse } from '#/interfaces/http/schemas/cook-to-order/cook-to-order-response.schema';
import { CookToOrderPresenter } from '#/interfaces/presenter/cook-to-order.presenter';

@injectable()
export class CookToOrderController {
    constructor(
        @inject(TYPES.Logger) private readonly logger: ILogger,
        @inject(TYPES.CreateCookToOrderUseCase) private readonly createCookToOrderUseCase: ICreateCookToOrderUseCase,
        @inject(TYPES.ListCookToOrderUseCase) private readonly listCookToOrderUseCase: IListCookToOrderUseCase,
        @inject(TYPES.StartCookToOrderUseCase) private readonly startCookToOrderUseCase: IStartCookToOrderUseCase,
        @inject(TYPES.ReadyCookToOrderUseCase) private readonly readyCookToOrderUseCase: IReadyCookToOrderUseCase,
    ) {}

    async create(request: CookToOrderCreateRequest): Promise<void> {
        this.logger.info('Creating a new cook to order', { request });
        await this.createCookToOrderUseCase.execute(request);
    }

    async list(status?: CookToOrderStatus): Promise<CookToOrderResponse[]> {
        this.logger.info('Listing cook to order', { status });
        const response = await this.listCookToOrderUseCase.execute(status);
        return response.map(item => CookToOrderPresenter.toHTTP(item));
    }

    async startCookToOrder(id: string): Promise<void> {
        this.logger.info('Start cook order');
        await this.startCookToOrderUseCase.execute(id);
    }

    async readyCookToOrder(id: string): Promise<void> {
        this.logger.info('Ready cook order');
        await this.readyCookToOrderUseCase.execute(id);
    }
}
