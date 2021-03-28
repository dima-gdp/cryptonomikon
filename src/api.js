import axios from "axios";

export async function getTickerList() {
	const fetchTickerList = await axios.get('https://min-api.cryptocompare.com/data/all/coinlist', {
		params: {
			summary: 'true',
			api_key: process.env.VUE_APP_API_KEY
		}
	})
	const data = await fetchTickerList.data
	const tickerList = Object.keys(data.Data).map(el => data.Data[el])
	return tickerList
}

const socket = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=' + process.env.VUE_APP_API_KEY);
const tickersHandlers = new Map()

socket.addEventListener('message', ev => {
	const response = JSON.parse(ev.data)
	if (!response.PRICE) {
		return
	}

	const handlers = tickersHandlers.get(response.FROMSYMBOL) ?? []
	handlers.forEach(cb => cb(response.PRICE))
})


function sendToWebSocket(message) {
	const stringifiedMessage = JSON.stringify(message);

	if (socket.readyState === WebSocket.OPEN) {
		socket.send(stringifiedMessage);
		return;
	}

	socket.addEventListener(
		"open",
		() => {
			socket.send(stringifiedMessage);
		},
		{once: true}
	);
}

function subscribeToTickerOnWs(ticker) {
	sendToWebSocket({
		action: "SubAdd",
		subs: [`5~CCCAGG~${ticker}~USD`]
	});
}

function unSubscribeToTickerOnWs(ticker) {
	sendToWebSocket({
		action: "SubRemove",
		subs: [`5~CCCAGG~${ticker}~USD`]
	});
}


export const subscribeToUpdateTicker = (ticker, cb) => {
	const subscribers = tickersHandlers.get(ticker) || [];
	tickersHandlers.set(ticker, [...subscribers, cb])
	subscribeToTickerOnWs(ticker)
}

export const unSubscribeToUpdateTicker = (ticker, cb) => {
	tickersHandlers.delete(ticker)
	unSubscribeToTickerOnWs(ticker)
}

export const errorWS = (cb) => {
	socket.addEventListener('error', (error) => {
		cb()
	})
}









