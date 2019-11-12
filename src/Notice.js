export default class Notice {
  static durations = {
    infinity: Infinity,
    short: 5000,
  };

  constructor() {
    this.$container = document.querySelector('.game__notice');

    this.clear = this.clear.bind(this);
  }

  push(message, duration = Notice.durations.infinity) {
    this.$container.innerHTML = message;
    this.$container.classList.remove('hidden');

    if (Number.isFinite(duration)) {
      setTimeout(this.clear, duration);
    }
  }

  clear() {
    this.$container.innerHTML = '';
    this.$container.classList.add('hidden');
  }
}
