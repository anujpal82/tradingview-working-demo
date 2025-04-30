import React, { useEffect, useRef } from "react";
import "./index.css";
import { widget } from "../../charting_library";
import DataFeed from "../api/index";
import { getLevels } from "../api/tvRequest";
import { getExchangeSegment, transformLevels } from "../api/utils";
import { subscribeToTicks } from "../api/stream";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export const TVChartContainer = () => {
  const chartContainerRef = useRef();
  const drawnLevelsRef = useRef([]); // Store drawn shape references
  const hasDrawnLevelsRef = useRef(false); // Prevent double draw
  const dataLoadedListenerRef = useRef(null); // Store dataLoaded listener

  const defaultProps = {
    symbol: "NIFTY:13",
    interval: "60",
    datafeedUrl: "https://demo_feed.tradingview.com",
    libraryPath: "/charting_library/",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    overrides: {
      "mainSeriesProperties.candleStyle.barSpacing": 10,
      "mainSeriesProperties.candleStyle.upColor": "#26a69a",
      "mainSeriesProperties.candleStyle.downColor": "#ef5350",
    },
  };

  useEffect(() => {
    console.log("Chart initialization starting");

    const widgetOptions = {
      symbol: defaultProps.symbol,
      datafeed: DataFeed,
      interval: defaultProps.interval,
      container: chartContainerRef.current,
      library_path: defaultProps.libraryPath,
      debug: true,
      locale: getLanguageFromURL() || "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: defaultProps.chartsStorageUrl,
      charts_storage_api_version: defaultProps.chartsStorageApiVersion,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      timezone: "Asia/Kolkata",
      ticker: "NIFTY:13",
      time_frames: [
        { text: "1D", resolution: "D", description: "1 Day" },
        { text: "1W", resolution: "W", description: "1 Week" },
        { text: "1M", resolution: "M", description: "1 Month" },
      ],
      overrides: {
        "mainSeriesProperties.style": 1,
        "mainSeriesProperties.visible": true,
      },
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      console.log("Chart is ready");
      

      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute("title", "Click to show a notification popup");
        button.classList.add("apply-common-tooltip");
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!");
            },
          })
        );
        button.innerHTML = "Check API";
      });

      const chart = tvWidget.chart();

      const drawLevels = (chartInstance, levels) => {
        try {
    
          drawnLevelsRef.current = [];

          levels.forEach((level) => {
            const shape = chartInstance.createShape(
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
            drawnLevelsRef.current.push(shape);
          });
        } catch (err) {
          console.log("Error in drawing levels:", err);
        }
      };

      const subscribeDataLoaded = () => {
        if (dataLoadedListenerRef.current) {
          chart.onDataLoaded().unsubscribe(dataLoadedListenerRef.current);
        }

        const listener = () => {
          if (hasDrawnLevelsRef.current) return;
          hasDrawnLevelsRef.current = true;

          const symbolInfo = chart.symbolExt();
          const [symbol, securityId] = symbolInfo.ticker.split(":");
          const cachedSymbolInfo = DataFeed.symbolDataCache[securityId];
          if (!cachedSymbolInfo) {
            console.warn("Missing cached symbol info for:", securityId);
            return;
          }

          const exchangeSegment = getExchangeSegment(
            cachedSymbolInfo.exchangeId,
            cachedSymbolInfo.segment
          );

          const payload = {
            securityId: securityId,
            exchangeSegment: exchangeSegment,
            instrument: cachedSymbolInfo?.instrument,
            interval: "60",
            oi: true,
            fromDate: "2025-04-15 09:00:00",
            toDate: "2025-04-23 15:30:00",
          };

          // getLevels(payload)
          //   .then((response) => {
          //     const transformedLevels = transformLevels(response);
          //     drawLevels(chart, transformedLevels);
          //   })
          //   .catch((err) => console.log("getLevels error:", err));
        };

        chart.onDataLoaded().subscribe(null, listener);
        dataLoadedListenerRef.current = listener;
       
      };

      chart.onSymbolChanged().subscribe(null, () => {
        console.log("Symbol changed");
        hasDrawnLevelsRef.current = false;
        subscribeDataLoaded();
      });

      // Initial subscription
      subscribeDataLoaded();
    });

    return () => {
      console.log("Cleaning up chart widget");
      tvWidget.remove();
    };
  }, []);

  return (
    <div
      ref={chartContainerRef}
      className={"TVChartContainer"}
      style={{ height: "600px", width: "100%" }}
    />
  );
};










