import{N as e}from"./index-Cioa8r3B.js";const o={onButtonText:"Legend",offButtonText:"Close Legend",order:1};function i(s){const n={h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h3,{children:"1. Price Model"}),`
`,e.jsx(n.p,{children:"These assumptions dictate how the simulator should forecast potential price paths."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Model"}),': This sets the price model using any of the widely used pricing models based on past Bitcoin price behavior, see "The Models" above for explainers.']}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Walk Strategy"}),": Bitcoins price does not follow a model price. It follows a non-random, ergodic, stochastic walk through a range of market forces. A walk strategy simulates this natural path representing how price fluctuations might occur."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Clamp Price to Max and Min"}),": Define maximum and minimum price constraints for the Bitcoin price simulation. Only applicable to some models."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Volatility (0-1)"}),": Adjust how much the Bitcoin price can fluctuate in the simulation."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Statistical Sample Count (1k-10k)"}),": The number of simulated samples to generate. A higher count can offer more accuracy but requires more processing resources."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Epoch Count (1-100)"}),": Set how many Bitcoin halving cycles the simulation will run into the future."]}),`
`]}),`
`,e.jsx(n.h3,{children:"2. Drawdown"}),`
`,e.jsx(n.p,{children:"These assumptions dictate how the simulator should drawdown bitcoin from the model price paths."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Bitcoin Holdings"}),": Enter the total amount of Bitcoin to draw down from. Defaults to the Block Reward for the current Epoch."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Yearly Expenses (USD)"}),": Specify yearly expenses in USD. Sub-dividing this is beyond the scope of this project. This should be inclusive of taxes from bitcoin sales, etc."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Expected Annual Inflation (%)"}),": Input the rate at which you expect expense prices to rise annually, affecting the value of money, cost of living, and any life-style improvements like raises, etc. Defaults to 8%, which is close to legacy money supply issuance."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"BTC Drawdown Starts"}),": This field indicates the starting point of Bitcoin depletion based on the simulation settings. Defaulted to today + 8 years."]}),`
`]}),`
`,e.jsx(n.h3,{children:"3. Visualization"}),`
`,e.jsx(n.p,{children:"These settings control the results you want to see, they do not affect model results."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Price, Drawdown"}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Walks: The individual simulation walks"}),`
`,e.jsx(n.li,{children:"Std Dev: One standard deviation and median on individual simulation walks"}),`
`,e.jsx(n.li,{children:"Quantile: From the top down, these are bands for the Highest Result, 99th percentile, 95th, 75th, Median, 25th, 5th, 1st, and Lowest Result"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Walk Count"}),": Number of walk counts to render (may impact performance)"]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Expenses"}),": Whether to show the weekly adjusted expenses, annualized"]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Model Max"}),": Whether to show the models ",e.jsx(n.strong,{children:"maximum"})," price target for any given date. The price can exceed this, or never reach this, depending on model and setting."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Model Min"}),": Whether to show the models ",e.jsx(n.strong,{children:"minimum"})," price target for any given date. The price can exceed this, or never reach this, depending on model and setting."]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{children:"4. Analyzing and Interpreting Results"}),`
`,e.jsx(n.p,{children:"The results displayed on the main graph provide critical insights into the sustainability of Bitcoin holdings against projected expenses as they are spent down across thousands of simulations. The descending green dotted line represents the median remaining Bitcoin balance across all simulations, indicating the point at which holdings could potentially be exhausted:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ORANGE QUANTILE BANDS"})," show the full range of possible PRICE outcomes, from best to worst-case scenarios, along with their associated probability, based on the model, volatility, and other set variables."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"YELLOW STD DEV BANDS"})," show one standard deviation of possible PRICE outcomes, from the median, based on the model, volatility, and other set variables."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"GREEN QUANTILE BANDS"})," show the range of possible DRAWDOWN outcomes, from best to worst-case scenarios, along with their associated probability, based on the starting amount of bitcoin, expenses, and other set variables."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"BLUE STD DEV BANDS"})," show one standard deviation of possible DRAWDOWN outcomes, from the median, based on the model, volatility, and other set variables."]}),`
`]}),`
`,e.jsx(n.h3,{children:"5. Adjustments and Reevaluations"}),`
`,e.jsx(n.p,{children:"In response to evolving market dynamics or changes in financial situation, it is crucial to adjust and reevaluate the strategies:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Update Inputs"}),": As market expectations, expense levels, or Bitcoin’s price volatility changes, revisit and adjust these inputs to maintain relevance."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Rerun Simulations"}),": Regularly rerun the simulations, especially after significant Bitcoin market movements or financial changes, to keep forecasts and planning up to date."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Explore Different Scenarios"}),": Periodically testing different worst and best-case scenarios can help prepare for various future financial landscapes."]}),`
`]}),`
`,e.jsx(n.p,{children:"This structured approach helps you effectively use the simulation tool to plan and manage a Bitcoin investment considering various economic conditions and personal financial goals."})]})}function r(s={}){const{wrapper:n}=s.components||{};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{r as default,o as frontmatter};
