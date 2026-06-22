const MAX_LENGTH = 140;

function buildGameChatMessages(placements) {
    const messages = [];

    for (const placement of placements) {
        if (
            !placement.operators ||
            placement.operators.length === 0
        ) continue;

        const prefix =
            `<size=30><color=#FFAA00>${placement.mission}:</color></size> `;

        let current = prefix;

        for (const operator of placement.operators) {
            const addition =
                current === prefix
                    ? operator
                    : `, ${operator}`;

            if ((current + addition).length > MAX_LENGTH) {
                messages.push(current);
                current = prefix + operator;
            } else {
                current += addition;
            }
        }

        if (current !== prefix) {
            messages.push(current);
        }
    }

    return messages;
}

module.exports = {
    buildGameChatMessages
};