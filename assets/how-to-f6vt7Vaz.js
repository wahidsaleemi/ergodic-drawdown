import{N as n}from"./index-Wg6PeR-f.js";const o={onButtonText:"How to use this website?",offButtonText:"Got it"};function t(i){const e={h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...i.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.h2,{children:"How to use this website"}),`
`,n.jsx(e.h3,{children:"1. Price Model Assumptions"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Model"}),': This sets the price model using any of the widely used pricing models based on past Bitcoin price behavior, see "The Models" above for explainers.']}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Walk Strategy"}),": Bitcoins price does not follow a model price. It follows a non-random, ergodic, stochastic walk through a range of market forces. A walk strategy simulates this pathing representing how price fluctuations might occur."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Clamp Price to Max and Min"}),": Define maximum and minimum price constraints for the Bitcoin price simulation. Only applicable to some models."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Volatility (0-1)"}),": Adjust how much the Bitcoin price can fluctuate in the simulation."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Statistical Sample Count (1k-10k)"}),": The number of simulated samples to generate. A higher count can offer more accuracy but requires more processing resources."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Epoch Count (1-100)"}),": Set how many Bitcoin halving cycles the simulation will run into the future."]}),`
`]}),`
`,n.jsx(e.h3,{children:"2. Drawdown Assumptions"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Bitcoin Holdings"}),": Enter the total amount of Bitcoin to draw down from. Defaults to the Block Reward for the current Epoch."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Yearly Expenses (USD)"}),": Specify yearly expenses in USD. Sub-dividing this is beyond the scope of this project. This should be inclusive of taxes from bitcoin sales, etc."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Expected Annual Inflation (%)"}),": Input the rate at which you expect expense prices to rise annually, affecting the value of money, cost of living, and any life-style improvements like raises, etc. Defaults to 8%, which is close to legacy money supply issuance."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"BTC Drawdown Starts"}),": This field indicates the starting point of Bitcoin depletion based on the simulation settings. Defaulted to today + 8 years."]}),`
`]}),`
`,n.jsx(e.h3,{children:"3. Visualization Options"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Price, Standard Deviation, Quantile"}),": These settings control the aspects of price behavior you want to visualize, allowing for a detailed examination of variability and potential outcomes."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.strong,{children:"Walk Count, Model Max, Model Min, Expenses"}),": These visualization settings help you understand the range of outcomes given your inputs and assumptions."]}),`
`]}),`
`,n.jsx(e.h3,{children:"4. Analyzing and Interpreting Results"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Review the main graph and associated metrics to understand the likelihood of Bitcoin asset depletion based on your current holdings and spending patterns. Given default settings, the descending Green Dotted line terminates at the median remaining BTC across all simulations."}),`
`,n.jsx(e.li,{children:"Analyze different scenarios to see how changes in market conditions or financial assumptions might affect longevity."}),`
`]}),`
`,n.jsx(e.h3,{children:"5. Adjustments and Reevaluations"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Modify your inputs based on changes in your financial situation, market conditions, or personal risk tolerance."}),`
`,n.jsx(e.li,{children:"Regularly update and rerun the simulation to keep your financial projections current and responsive to new information."}),`
`]}),`
`,n.jsx(e.p,{children:"This structured approach helps you effectively use the simulation tool to plan and manage your Bitcoin investments considering various economic conditions and personal financial goals."})]})}function r(i={}){const{wrapper:e}=i.components||{};return e?n.jsx(e,{...i,children:n.jsx(t,{...i})}):t(i)}export{r as default,o as frontmatter};
