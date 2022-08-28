export default interface IWorker<I, T> {
    process(input: I): Promise<T>;
    init?(): any;
    destroy?(): any;
}