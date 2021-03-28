<template>
	<div class="currencies__item">
		<div class="currencies__head">
       <span class="currencies__icon">
        	<img :src="'https://www.cryptocompare.com/' + ticker.img" alt="Иконка"/>
			 </span>
			<span class="currencies__name">{{ ticker.name }}</span>
		</div>
		<span class="currencies__value">{{ ticker.price }} USD</span>
		<ul class="currencies__buttons currencies-buttons">
			<li class="currencies-buttons__item">
				<button
					class="currencies-buttons__btn"
					@click="$emit('deleteTicker', ticker.name)"
				>Удалить</button
				>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: ['ticker']
}
</script>
