import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import "./App.css";

type chartDataType = {
  date: number;
  value: number;
};

function App() {
  const chartRef = useRef<am5xy.XYChart>();
  const rootRef = useRef<am5.Root>();
  const seriesRef = useRef<am5xy.LineSeries>();
  const xAxisRef = useRef<am5xy.DateAxis<am5xy.AxisRenderer>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<chartDataType[]>([]);

  useEffect(() => {
    const root = am5.Root.new("chartdiv");
    root.setThemes([am5themes_Animated.new(root)]);
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.5,
        extraMin: -0.1,
        extraMax: 0.1,
        groupData: false,
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY}",
        }),
      })
    );

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: undefined,
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: series.get("fill"),
        }),
      });
    });

    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: xAxis,
      })
    );
    cursor.lineY.set("visible", false);

    rootRef.current = root;
    chartRef.current = chart;
    seriesRef.current = series;
    xAxisRef.current = xAxis;
    return () => {
      root!.dispose();
    };
  }, []);

  useEffect(() => {
    let value = 100;
    let chartData: chartDataType[] = [];
    let firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - 1000);
    firstDate.setHours(0, 0, 0, 0);

    for (var i = 0; i < 16; i++) {
      let newDate = new Date(firstDate);
      newDate.setDate(newDate.getDate() + i);

      value += (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10;

      chartData.push({
        date: newDate.getTime(),
        value: value,
      });
    }
    setData(chartData);
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.data.setAll(data);
    }
  }, [data]);

  useEffect(() => {
    setInterval(function () {
      addData();
    }, 1000);
  }, []);

  function addData() {
    const series = seriesRef.current;
    const xAxis = xAxisRef.current;
    if (series && xAxis) {
      let value = 100;
      const lastDataItem = series.dataItems[series.dataItems.length - 1];
      const lastValue = lastDataItem.get("valueY");
      const newValue =
        value + (Math.random() < 0.5 ? 1 : -1) * Math.random() * 6;
      const lastDate = new Date(lastDataItem.get("valueX")!);
      const time = am5.time.add(new Date(lastDate), "day", 1).getTime();
      series.data.removeIndex(0);
      series.data.push({
        date: time,
        value: newValue,
      });

      const newDataItem = series.dataItems[series.dataItems.length - 1];
      newDataItem.animate({
        key: "valueYWorking",
        to: newValue,
        from: lastValue,
        duration: 600,
        easing: am5.ease.linear,
      });

      const animation = newDataItem.animate({
        key: "locationX",
        to: 0.5,
        from: -0.5,
        duration: 600,
      });
      if (animation) {
        const tooltip = xAxis.get("tooltip");
        if (tooltip && !tooltip.isHidden()) {
          animation.events.on("stopped", function () {
            xAxis.updateTooltip();
          });
        }
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}

export default App;
