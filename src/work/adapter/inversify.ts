import {Container, decorate, inject, injectable} from "inversify";
import {WorkPersistenceAdapter} from "./outgoing/WorkPersistenceAdapter";
import * as axiosModule from "../../infrastructure/remote-call/inversify";
import {WorkService} from "../application/WorkService";

const TYPES = {
  WorkPersistenceAdapterId: Symbol.for("WorkPersistenceAdapter"),
  WorkGetUseCaseId: Symbol.for("WorkGetUseCase"),
  WorkFindAllUseCaseId: Symbol.for("WorkFindAllUseCase"),
  WorkGetPrevOrNextUseCaseId: Symbol.for("WorkGetPrevOrNextUseCase"),
};

export const { WorkGetUseCaseId, WorkFindAllUseCaseId, WorkGetPrevOrNextUseCaseId } = TYPES;

export const decorateClasses = () => {
  decorate(injectable(), WorkPersistenceAdapter);
  decorate(inject(axiosModule.AxiosId), WorkPersistenceAdapter, 0);

  decorate(injectable(), WorkService);
  decorate(inject(TYPES.WorkPersistenceAdapterId), WorkService, 0);
  decorate(inject(TYPES.WorkPersistenceAdapterId), WorkService, 1);
};

export const bind = (container: Container) => {
  container.bind(TYPES.WorkPersistenceAdapterId).to(WorkPersistenceAdapter);
  container.bind(TYPES.WorkGetUseCaseId).to(WorkService);
  container.bind(TYPES.WorkGetPrevOrNextUseCaseId).to(WorkService);
  container.bind(TYPES.WorkFindAllUseCaseId).to(WorkService);
};
