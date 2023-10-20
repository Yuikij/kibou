function ThreadSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {ThreadSleep}