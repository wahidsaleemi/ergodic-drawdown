import{N as e}from"./index-CdnaB7mq.js";const r={onButtonText:"The Models",offButtonText:"Got it"};function t(n){const i={a:"a",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{children:"The Models"}),`
`,e.jsx(i.h3,{children:"1. Arithmetic (Linear)"}),`
`,e.jsx(i.p,{children:"This model assumes a linear growth or decline rate of Bitcoin prices over time. It's the simplest model and typically used for short-term forecasts. It also happens to be irrelevant, as nothing in finance and economics follows a Linear path but it is included for completeness."}),`
`,e.jsx(i.h3,{children:"2. Quadratic (Polynomial)"}),`
`,e.jsx(i.p,{children:"This model captures curvature in price trends by including a squared term, allowing for acceleration or deceleration in price changes, which may reflect market cycles more accurately than a linear model, but is generally still wanting."}),`
`,e.jsx(i.h3,{children:"3. Power Law Regression Median (Logarithmic)"}),`
`,e.jsx(i.p,{children:"This model uses a power law applied to the median values of historical price data, assuming that price changes are proportional to current prices at a constant rate. It's useful for long-term predictions and highlighting potential price scales."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Power_law",children:"Further Reading on Power Law"})}),`
`]}),`
`,e.jsx(i.h3,{children:"4. Power Law Support Line (Logarithmic)"}),`
`,e.jsx(i.p,{children:"Similar to the regression median but focuses on providing a support line. This model identifies lower boundaries for Bitcoin prices, assuming that the price adheres to a logarithmic scale of minimum values over time."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://powerlawbtc.com/",children:"Power Law for Bitcoin"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9",children:"The Bitcoin Power Law Theory"})}),`
`]}),`
`,e.jsx(i.h3,{children:"5. Rainbow Chart (Logarithmic)"}),`
`,e.jsx(i.p,{children:"This chart is a colorful logarithmic regression model that categorizes price movements into different probability bands. It's popular for visualizing long-term trends and speculative bubbles in a visually intuitive manner."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://www.bitcoinmagazinepro.com/charts/bitcoin-rainbow-chart/",children:"Exploration of Rainbow Charts"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://www.blockchaincenter.net/en/bitcoin-rainbow-chart/",children:"Original Rainbow Chart"})}),`
`]}),`
`,e.jsx(i.h3,{children:"6. CAGR (Geometric)"}),`
`,e.jsx(i.p,{children:"The Compound Annual Growth Rate (CAGR) model calculates the geometric progression ratio that provides a constant rate of return over a specific time period. This model is good for assessing what the average annual growth rate of Bitcoin has been over multiple years."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://bitcoincompounding.com/",children:"Bitcoin Fire Calculator"})}),`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://www.bitcoinisthebettermoney.com/cagr",children:"Bitcoin: 4-Year Returns"})}),`
`]}),`
`,e.jsx(i.h3,{children:"7. Stock-To-Flow 2024 Refit (Exponential)"}),`
`,e.jsx(i.p,{children:"This model is a variant of the traditional stock-to-flow model, refitted to account for conditions expected in 2024. It focuses on predicting Bitcoin prices based on the ratio of existing stockpiles (or reserves) to the flow of new units coming into circulation."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://www.bitcoinmagazinepro.com/charts/stock-to-flow-model/",children:"Understanding Stock-To-Flow"})}),`
`]}),`
`,e.jsx(i.h3,{children:"8. Stock-To-Flow (Exponential)"}),`
`,e.jsx(i.p,{children:"The original stock-to-flow model projects Bitcoin's price based on its scarcity as defined by the ratio of existing stock to new production rate. This exponential model is particularly popular for its bullish long-term price projections of Bitcoin."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.a,{href:"https://charts.bitbo.io/stock-to-flow/",children:"Stock To Flow"})}),`
`]}),`
`,e.jsx(i.p,{children:"Each of these models offers different insights based on varying mathematical assumptions, allowing users to explore various scenarios and their potential impacts on Bitcoin’s future pricing."})]})}function s(n={}){const{wrapper:i}=n.components||{};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{s as default,r as frontmatter};
