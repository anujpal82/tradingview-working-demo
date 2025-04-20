	import React, { useEffect, useRef } from 'react';
	import './index.css';
	import { widget } from '../../charting_library';
	import DataFeed from '../api/index'

	function getLanguageFromURL() {
		const regex = new RegExp('[\\?&]lang=([^&#]*)');
		const results = regex.exec(window.location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}
	console.log({datafeed:DataFeed})
	export const TVChartContainer = () => {
		const chartContainerRef = useRef();

		const defaultProps = {
			symbol: 'NIFTY:13',
			interval: 'D',
			datafeedUrl: 'https://demo_feed.tradingview.com',
			libraryPath: '/charting_library/',
			// chartsStorageUrl: 'https://saveload.tradingview.com',
			chartsStorageApiVersion: '1.1',
			clientId: 'tradingview.com',
			userId: 'public_user_id',
			fullscreen: false,
			autosize: true,
			studiesOverrides: {},
		};

		useEffect(() => {
			const widgetOptions = {
				symbol: defaultProps.symbol,
				// BEWARE: no trailing slash is expected in feed URL
				// datafeed: DataFeed,
				datafeed: DataFeed,
				interval: defaultProps.interval,
				container: chartContainerRef.current,
				library_path: defaultProps.libraryPath,
				debug:true,	
				locale: getLanguageFromURL() || 'en',
				disabled_features: ['use_localstorage_for_settings'],
				enabled_features: ['study_templates'],
				charts_storage_url: defaultProps.chartsStorageUrl,
				charts_storage_api_version: defaultProps.chartsStorageApiVersion,
				client_id: defaultProps.clientId,
				user_id: defaultProps.userId,
				fullscreen: defaultProps.fullscreen,
				autosize: defaultProps.autosize,
				studies_overrides: defaultProps.studiesOverrides,
				timezone: 'Asia/Kolkata', 
				ticker: 'NIFTY:13',
			};

			const tvWidget = new widget(widgetOptions);

			tvWidget.onChartReady(() => {
				tvWidget.headerReady().then(() => {
					const button = tvWidget.createButton();
					button.setAttribute('title', 'Click to show a notification popup');
					button.classList.add('apply-common-tooltip');
					button.addEventListener('click', () => tvWidget.showNoticeDialog({
						title: 'Notification',
						body: 'TradingView Charting Library API works correctly',
						callback: () => {
							console.log('Noticed!');
						},
					}));

					button.innerHTML = 'Check API';
				});
				const levels = [
					{ price: 24000, text: "R1", color: "#FF0000" },
					{ price: 26000, text: "R2", color: "#FF0000" },
					{ price: 21757, text: "Bottom", color: "#0000FF" },
					{ price: 22000, text: "S1", color: "#00FF00" },
					{ price: 22344, text: "S2", color: "#00FF00" }
				];
				const chart = tvWidget.chart();
				const drawLevels = (chartInstance) => {
					levels.forEach((level) => {
						chartInstance.createShape(
							{ price: level.price },
							{
								shape: "horizontal_line",
								lock: true,
								disableSelection: false,
								disableSave: false,
								disableUndo: false,
								text: level.text,
								overrides: {
									linecolor: level.color,
									linestyle: 0,
									linewidth: 2,
									showLabel: true,
									textcolor: level.color,
									fontsize: 12,
								},
							}
						);
					});
				};
				
				// Initial draw
				drawLevels(chart);
				
    
				// Draw the horizontal line at price 22000
				chart.onSymbolChanged().subscribe(null, () => {
					console.log("Symbol changed");

					chart.onDataLoaded().subscribe(null, () => {
						console.log("Data loaded for new symbol, drawing levels");
						drawLevels(chart);
					});
				});
				
				  
			});

			return () => {
				tvWidget.remove();
			};
		});

		console.log({chartContainerRef,defaultProps})
		return (
			<div
				ref={chartContainerRef}
				className={'TVChartContainer'}
			/>
		);
	}
