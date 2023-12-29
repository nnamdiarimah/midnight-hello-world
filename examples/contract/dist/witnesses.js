export const createMessagePrivateState = () => ({
    message: null,
});
export const witnesses = {
    local_message: ({ privateState }) => [
        privateState,
        privateState.message
            ? { is_some: true, value: privateState.message }
            : { is_some: false, value: '' },
    ]
};
//# sourceMappingURL=witnesses.js.map