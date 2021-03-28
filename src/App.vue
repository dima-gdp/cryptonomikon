<template>
  <section class="hero">
    <div class="hero__container container">
      <h2 class="visually-hidden">Критповалюта</h2>
      <div class="add">
        <label class="add__label">
          Тикер
          <input
            class="add__input"
            type="text"
            placeholder="Например BTC"
            v-model="tickerInput"
            @input = "$event.target.composing = false"
            @keydown.enter="addTicker(tickerInput)"
          />
        </label>
        <ul class="add__complete">
          <li v-for="t in tooltips" :key="t.id">
            <button @click="addTicker(t.Symbol)" type="button">
              {{ t.Symbol }}
            </button>
          </li>
        </ul>
        <div v-show="warning" class="add__warning">
          {{ warning }}
        </div>
        <button @click="addTicker(tickerInput)" type="button" class="add__btn">
          Добавить
        </button>
      </div>

      <ul class="hero__currencies currencies">
        <li class="currencies__column" v-for="t in tickersCards" :key="t.name">
					<TickerItem :ticker="t" @deleteTicker="deleteTicker($event)" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import {
  getTickerList,
  subscribeToUpdateTicker,
  unSubscribeToUpdateTicker,
	errorWS
} from '@/api';
import TickerItem from '@/components/TickerItem'

export default {
  name: 'App',
	components: {TickerItem},
  data() {
    return {
      tickersData: null,
      tickerInput: '',
      tooltips: [],
      tickersCards: [],
      warning: false,
    };
  },
  computed: {
    addedTickers() {
      return this.tickersCards.map((el) => el.name);
    },
  },
  methods: {
  	getTickerImg(symbol){
			const ticker = this.tickersData.find(t => t.Symbol === symbol)
			return ticker.ImageUrl
		},
    async addTicker(tickerSymbol) {
			tickerSymbol = tickerSymbol.toUpperCase()
      try {
        if (this.addedTickers.includes(tickerSymbol)) {
          this.warning = 'Такой тикет уже добавлен';
        } else if (!this.tickersData.find((el) => el.Symbol === tickerSymbol)) {
          this.warning = 'Такого тикера нет';
        } else {
          this.warning = false;
          const ticketItem = { name: tickerSymbol, price: '-', img: this.getTickerImg(tickerSymbol)};
          this.tickersCards.push(ticketItem);
          this.updateLocalStorage()
          subscribeToUpdateTicker(tickerSymbol, (newPrice) => {
          	const updatedTicker = this.tickersCards.find((el) => el.name === tickerSymbol)
						updatedTicker.price = newPrice;
          });
          this.tickerInput = ''
        }
      } catch (e) {
        this.warning = 'Ошибка получения данных с сервера';
      }
    },
    deleteTicker(symbol) {
      this.tickersCards = this.tickersCards.filter((el) => el.name !== symbol);
			this.updateLocalStorage()
      unSubscribeToUpdateTicker(symbol);
    },
		updateLocalStorage(){
			localStorage.setItem('addedTickers', JSON.stringify(this.tickersCards))
		},
		getTickersFromLocalStorage(){
			this.tickersCards = JSON.parse(localStorage.getItem('addedTickers')) ?? []
			if (this.tickersCards.length){
				this.tickersCards.forEach((el) => {
					subscribeToUpdateTicker(el.name, (newPrice) => {
						el.price = newPrice;
					});
				})
			}
		},
    viewTooltip() {
      const str = this.tickerInput.toLowerCase();
      if(+str === 0 && str !== '0') {
        this.tooltips = []
        return
      }
      this.tooltips = this.tickersData
        .filter((el) => el.FullName.toLowerCase().includes(str))
        .slice(0, 4);
    },
  },
	watch: {
  	tickerInput(){
  		this.viewTooltip()
		}
	},
  async mounted() {
    this.tickersData = await getTickerList();
		this.getTickersFromLocalStorage()
		errorWS(() => {
			this.warning = 'Ошибка соединения с WebSocket'
		})
  },
};
</script>
<style lang="scss" src="@/assets/scss/styles.scss">
</style>
