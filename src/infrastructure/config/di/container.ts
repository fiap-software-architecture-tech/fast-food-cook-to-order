import { Container } from 'inversify';

import { bindGateways } from '#/infrastructure/config/di/bindings/gateways';
import { bindRepositories } from '#/infrastructure/config/di/bindings/repositories';
import { bindServices } from '#/infrastructure/config/di/bindings/services';

const container = new Container();

bindGateways(container);
bindRepositories(container);
bindServices(container);

export { container };
