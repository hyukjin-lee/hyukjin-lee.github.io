import {Container, decorate, inject, injectable} from "inversify";
import {LifePersistenceAdapter} from "./outgoing/LifePersistenceAdapter";
import * as axiosModule from "../../infrastructure/remote-call/inversify";
import {LifeService} from "../application/LifeService";

const TYPES = {
  LifePersistenceAdapterId: Symbol.for("LifePersistenceAdapter"),
  LifeGetUseCaseId: Symbol.for("LifeGetUseCase"),
  LifeFindAllUseCaseId: Symbol.for("LifeFindAllUseCase"),
  LifeGetPrevOrNextUseCaseId: Symbol.for("LifeGetPrevOrNextUseCase"),
};

export const { LifeGetUseCaseId, LifeFindAllUseCaseId, LifeGetPrevOrNextUseCaseId } = TYPES;

export const decorateClasses = () => {
  decorate(injectable(), LifePersistenceAdapter);
  decorate(inject(axiosModule.AxiosId), LifePersistenceAdapter, 0);

  decorate(injectable(), LifeService);
  decorate(inject(TYPES.LifePersistenceAdapterId), LifeService, 0);
  decorate(inject(TYPES.LifePersistenceAdapterId), LifeService, 1);
};

export const bind = (container: Container) => {
  container.bind(TYPES.LifePersistenceAdapterId).to(LifePersistenceAdapter);
  container.bind(TYPES.LifeGetUseCaseId).to(LifeService);
  container.bind(TYPES.LifeGetPrevOrNextUseCaseId).to(LifeService);
  container.bind(TYPES.LifeFindAllUseCaseId).to(LifeService);
};
