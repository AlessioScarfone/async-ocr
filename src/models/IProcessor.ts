export default interface IProcessor<I, T> {
    process(input: I): Promise<T>;
    init?(): any;
    destroy?(): any;
}