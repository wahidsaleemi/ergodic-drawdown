import{N as e}from"./index-CrXuL5MK.js";const o={onButtonText:"FAQ",offButtonText:"Got it"};function t(i){const n={a:"a",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{children:"Frequently Asked Questions (FAQ)"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What is drawdown in the context of Bitcoin financial modeling?"})}),`
`,e.jsx(n.p,{children:"Drawdown refers to the reduction in one's Bitcoin holdings as a result of withdrawals or expenditures. In financial terms, it's the peak-to-trough decline during a specific recorded period of an investment. In the context of Bitcoin financial modeling, such as on the website using Monte Carlo simulations, drawdown specifically addresses how much Bitcoin balance decreases over time due to regular withdrawals to meet expenses or other financial obligations."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:'What does "ergodic" mean in the context of this Bitcoin drawdown tool?'})}),`
`,e.jsx(n.p,{children:'In the context of this tool, "ergodic" refers to the assumption that over a long period, the average results of the Bitcoin price simulations will represent the ensemble average across many different economic scenarios. This concept is critical in ensuring that the projections made by our tool reflect a comprehensive range of possible futures, not just a single trajectory.'}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How does the Monte Carlo simulation method work for Bitcoin drawdown?"})}),`
`,e.jsx(n.p,{children:"The Monte Carlo simulation method involves running a large number of simulations ('walks') to forecast the future behavior of Bitcoin prices. By inputting different parameters like volatility and walk strategies, the tool generates multiple potential outcomes, helping to illustrate the range of possible scenarios for Bitcoin holdings over time, and their associated probability."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What is meant by 'walks' in this simulation?"})}),`
`,e.jsx(n.p,{children:"'Walks' refer to individual iterations of the Monte Carlo simulation, where the Bitcoin price is projected forward in time based on predefined volatility, strategy, and other factors. Each walk represents a possible future path that Bitcoin's price might take, contributing to the broader statistical analysis of potential outcomes."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Why is understanding quantiles important in analyzing the simulation results?"})}),`
`,e.jsx(n.p,{children:"Quantiles are essential for understanding the distribution of possible Bitcoin prices at the end of the simulation period. By examining different quantiles (e.g., 25th, 75th, 99th percentiles), users can gauge the range of best to worst-case scenarios and plan their financial strategies accordingly."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How do different walk strategies impact the outcomes of the simulations?"})}),`
`,e.jsx(n.p,{children:"Different walk strategies follow waypoints, paths, logic, and other inputs to alter their course. Set the volatility to 0 to see how each walk operates without noise."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What is the primary goal of this Bitcoin drawdown simulation?"})}),`
`,e.jsx(n.p,{children:"The primary goal is to help Bitcoin holders understand and plan for future financial scenarios where they might begin to draw on their Bitcoin holdings. By simulating different market conditions and personal spending requirements, users can better plan."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Who should use this simulation tool?"})}),`
`,e.jsx(n.p,{children:"This tool is designed for people who save in bitcoin who are considering using their holdings as a source of regular income, financial planners advising on cryptocurrency assets, or anyone interested in understanding the long-term financial implications of holding and using Bitcoin. For all users, this tool does not in any way constitute financial advice. Please speak with a licensed financial planner before making any finacial decisions."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How accurate are the predictions made by the Monte Carlo simulation?"})}),`
`,e.jsx(n.p,{children:"While the Monte Carlo simulation provides a robust model by considering thousands of possible outcomes, all predictions are hypothetical. They are based on historical data, statistical assumptions, and pure random number generation, and should be used as one of many tools in financial planning. Again consult with a financial planner."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Can this tool predict the future price of Bitcoin?"})}),`
`,e.jsx(n.p,{children:"No. The tool is not designed to predict exact future prices but rather to offer scenarios based on different inputs. It helps users understand potential volatility and drawdown risks under various conditions."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What are the limitations of this simulation tool?"})}),`
`,e.jsx(n.p,{children:"Limitations include the reliance on historical data, which may not capture future market conditions accurately. The tool also assumes certain financial and economic conditions will remain constant, which may not be the case. The base assumption is that all models will be proven wrong, and thus many models are included. As such, the modeling assumes ergodicity to a fault, and this too, might prove wanting in time."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How often is the data and model updated?"})}),`
`,e.jsxs(n.p,{children:["This tool scrapes the current daily price of bitcoin, and keeps a record of past prices. All other information is generated based on user input. For model requests, open a ",e.jsx(n.a,{href:"https://github.com/GildedPleb/ergodic-drawdown/issues/new",children:"github issue"}),"."]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:'What does "Weekly Adjusted Cost of Living Annualized" mean?'})}),`
`,e.jsx(n.p,{children:"An estimation of how much it costs to live for a week, with this figure then being extrapolated to reflect an entire year."}),`
`]}),`
`]})]})}function r(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{r as default,o as frontmatter};
