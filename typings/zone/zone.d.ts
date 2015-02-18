declare module Zone {
	export class Stacktrace {
		constructor(e: Error);
		get(): string;
	}
}


declare class Zone {
	constructor(parentZone: Zone, data: any);
	fork(locals: any): Zone;
	bind(fn, skipEnqueue): void;
	bindOnce(fn): any;
	run(fn, applyTo?, applyWith?): void;
	beforeTask(): void;
	onZoneCreated(): void;
	afterTask(): void;
	enqueueTask(): void;
	dequeueTask(): void;

	static patchSetClearFn(obj, fnNames): string;
	static patchPrototype(obj, fnNames): any;
	static bindArguments(args: any[]): any;
	static bindArgumentsOnce(args: any[]): any;
	static patchableFn(obj, fnNames): any
	static patchProperty(obj, prop): void;
	static patchProperties(obj, properties): void;
	static patchEventTargetMethods(obj): void;
	static patch(): void;
	static canPatchViaPropertyDescriptor(): boolean;
	static patchViaPropertyDescriptor(): void;
	static patchViaCapturingAllTheEvents(): void;
	static patchWebSocket(): void;
	static patchClass(className: string): void;
	static patchMutationObserverClass(className: string): void;
	static patchDefineProperty(): void;
	static patchRegisterElement(): void;
	static eventNames: string;
	static onEventNames: string;
	static init(): void;
	static exceptZone: {
        boringZone: Zone;
        interestingZone: Zone,
        beforeTask: () => void;
        afterTask: () => void;
        fork: (ops: any) => Zone;
	};
	static longStackTraceZone: {
		getLongStacktrace(exception: any): string;
		stackFramesFilter(line: string): boolean;
		onError(exception): void;
		fork(locals): Zone;
	};
	static getStacktrace(): Zone.Stacktrace;
	static countingZone: {
		'+enqueueTask': () => void;
		'-dequeueTask': () => void;
		'+afterTask': () => void;
		counter: () => void;
		data: {
			count: number;
			flushed: boolean;
		};
		onFlush: () => void;
	};
}
