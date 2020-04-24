import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import "./Chart.css";
import debug from "sabio-debug";
const logger = debug.extend("important");

const currentDate = new Date();

const BarChart = (props) => {
  logger(props);
  const totalCount = props.data.length;
  const doubleYAxis = typeof props.yAxis === "object" && props.yAxis.length > 1;
  const filteredData = filterAnnualData(props.data);
  const barData = transformToBarData(filteredData);
  const lineData = transformToLineData(barData, totalCount);

  const labels = rotateArrayRight(
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    11 - currentDate.getMonth()
  );
  const data = {
    datasets: [
      {
        label: "Total followers",
        type: "line",
        data: lineData,
        fill: false,
        borderColor: "#EC932F",
        backgroundColor: "#EC932F",
        pointBorderColor: "#EC932F",
        pointBackgroundColor: "#EC932F",
        pointHoverBackgroundColor: "#EC932F",
        pointHoverBorderColor: "#EC932F",
        yAxisID: "y-axis-1",
      },
      {
        type: "bar",
        label: "New followers",
        data: barData,
        fill: false,
        backgroundColor: "#292d61",
        borderColor: "#71B37C",
        hoverBackgroundColor: "#333a79",
        hoverBorderColor: "#71B37C",
        yAxisID: "y-axis-2",
      },
    ],
  };
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      mode: "label",
    },
    elements: {
      line: {
        fill: false,
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
          },
          labels: labels,
        },
      ],
      yAxes: [
        {
          type: "linear",
          display: true,
          position: "left",
          id: "y-axis-1",
          gridLines: {
            display: false,
          },
          labels: {
            show: true,
          },
          ticks: {
            minStepSize: 1,
          },
        },
        {
          type: "linear",
          display: true,
          position: "right",
          id: "y-axis-2",
          gridLines: {
            display: false,
          },
          labels: {
            show: true,
          },
          ticks: {
            stepSize: 1,
          },
        },
      ],
    },
  };

  return (
    <div className="d-block card py-3 card-box">
      {props.title && <h2 className="text-center">{props.title}</h2>}
      <div className="d-flex justify-content-center">
        <h4 className="rotate-270 align-self-center my-0">
          {doubleYAxis ? props.yAxis[0] : props.yAxis}
        </h4>
        <div className="position-relative chart">
          <Bar data={data} options={options} />
        </div>
        {doubleYAxis && (
          <h4 className="rotate-90 align-self-center my-0">{props.yAxis[1]}</h4>
        )}
      </div>
    </div>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
  yAxis: PropTypes.oneOfType(
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ),
};

export default React.memo(BarChart);

function transformToBarData(data) {
  let result = [];
  result = fillDataBuckets(data);
  result = rotateArrayRight(result, 11 - currentDate.getMonth());
  return result;
}

function transformToLineData(barData, totalCount) {
  let result = [];
  result[barData.length - 1] = totalCount;
  for (let i = barData.length - 2; i >= 0; i--) {
    result[i] = result[i + 1] - barData[i + 1];
  }
  return result;
}

function filterAnnualData(data) {
  const lastYear = new Date() - 365 * 24 * 60 * 60 * 1000;
  return data.filter((element) => new Date(element) > lastYear);
}

function fillDataBuckets(data) {
  let result = new Array(12).fill(0);
  data.forEach((element) => result[new Date(element).getMonth()]++);
  return result;
}

function rotateArrayRight(array, shift) {
  return array.map(
    (element, index) => array[(array.length + index - shift) % array.length]
  );
}
