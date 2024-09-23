const getDateString = (date: Date) => {
    const dateTimestamp = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
    const hoursTimeStamp = getTimeString(date, false);
    return `${dateTimestamp} ${hoursTimeStamp}`;
};

const getTimeString = (date: Date, includeSeconds: boolean) => {
    const hoursSecondsTimestamp = [date.getHours(), date.getMinutes()];
    if (includeSeconds) {
        hoursSecondsTimestamp.push(date.getSeconds());
    }
    return hoursSecondsTimestamp.join(':');
};

export const getDateTime = (timezone?: number) => {
    const date = new Date();

    if (timezone) {
        date.setHours(date.getHours() + timezone);
    }

    return getDateString(date);
};

export const getTime = async (timezone?: number): Promise<any> => {
    const date = new Date();

    if (timezone) {
        date.setHours(date.getHours() + timezone);
    }
    return getTimeString(date, true);
};
