import { Container } from 'inversify';

import { bindControllers } from '#/infrastructure/config/di/bindings/controllers';
import { bindGateways } from '#/infrastructure/config/di/bindings/gateways';
import { bindRepositories } from '#/infrastructure/config/di/bindings/repositories';
import { bindServices } from '#/infrastructure/config/di/bindings/services';
import { bindUseCases } from '#/infrastructure/config/di/bindings/use-cases';

const container = new Container();

bindControllers(container);
bindGateways(container);
bindRepositories(container);
bindServices(container);
bindUseCases(container);

export { container };
