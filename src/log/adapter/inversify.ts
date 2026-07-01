import {Container, decorate, inject, injectable} from "inversify";
import * as axiosModule from "../../infrastructure/remote-call/inversify";
import {LogPersistenceAdapter} from "./outgoing/LogPersistenceAdapter";
import {LogService} from "../application/port/LogService";

const TYPES = {
  LogPersistenceAdapterId: Symbol.for("LogPersistenceAdapter"),
  LogGetUseCaseId: Symbol.for("LogGetUseCase"),
  LogFindAllUseCaseId: Symbol.for("LogFindAllUseCase"),
};

export const { LogGetUseCaseId, LogFindAllUseCaseId } = TYPES;

export const decorateClasses = () => {
  decorate(injectable(), LogPersistenceAdapter);
  decorate(inject(axiosModule.AxiosId), LogPersistenceAdapter, 0);

  decorate(injectable(), LogService);
  decorate(inject(TYPES.LogPersistenceAdapterId), LogService, 0);
};

export const bind = (container: Container) => {
  container.bind(TYPES.LogPersistenceAdapterId).to(LogPersistenceAdapter);
  container.bind(TYPES.LogGetUseCaseId).to(LogService);
  container.bind(TYPES.LogFindAllUseCaseId).to(LogService);
};
