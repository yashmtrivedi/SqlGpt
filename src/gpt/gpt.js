import React, { useEffect, useState } from 'react';
import "./Gpt.css";
import { getSales } from '../services/sales'
import { getOpenai, openai } from '../services/openai';
import { getSqlQuery } from '../services/getSqlQuery';
import { getRDSQuery } from '../services/getRDSQuery';
import { getQueryExecutionResult } from '../services/getQueryExecutionResult';
import { getRDSQueryExplanation } from '../services/getRDSQueryExplnation';
// import headerImage from '../images/SqlGPT.png'
import Spinner from '../Spinner/Spinner';

function query_between_strings(str) {
    const startStr = 'WITH';
    const endStr = "Explanation:";
    const regex_pattern = 'WITH';
    const alternate_pattern = 'SELECT';
    const alternate_pattern2 = ':(.*)';
    try {
        startStr = str.match(regex_pattern);
        console.log("match: " + startStr)
        if (startStr == null) {
            startStr = str.match(alternate_pattern);
            console.log("match1: " + startStr)
        }

    } catch (error) {
        console.log(error)
    }


    const pos = str.indexOf(startStr);
    return (str.substring(pos, str.indexOf(endStr, pos))).replace('sql', '').replace('```', '');
}

const DATABASES = {
    ATHENA: 'ATHENA',
    RDS: 'RDS'
}

function Gpt() {
    const [sales, setsales] = useState([]);
    const [selectedDatabase, setDatabase] = useState(DATABASES.ATHENA);
    const [openai, setopenai] = useState([]);
    const [getSqlQueryRes, setGetSqlqueryRes] = useState({ query: '', explanation: '' });
    const [ldmText, setLdmText] = useState("");
    const [enteredText, setEnteredText] = useState("");
    const [submittedText, setSubmittedText] = useState(null);
    const [res, setRes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});


    const ldmHandler = (i) => {
        const ldm = i.target.value;
        setLdmText(ldm);
        localStorage.setItem("ldm", ldm);
    };

    const textChangeHandler = (i) => {
        setEnteredText(i.target.value);
    };


    const onQyeryHandler = (event) => {
        setLoading(true);
        setopenai('');
        const tempsetsub = enteredText;
        setSubmittedText(tempsetsub);
        setGetSqlqueryRes({});
        if (tempsetsub != null) {
            const ldm = localStorage.getItem("ldm");
            getSqlQuery(ldm + "\n Generate SQL query to " + tempsetsub + " as per Apache Presto syntax and please note below 2 points:-\n 1.prefix all column names with table alias.\n 2.if query is complex use CTE.")
                .then(response => {
                    const { content } = response;
                    setGetSqlqueryRes({
                        query: query_between_strings(content),
                        explanation: content.split(";")[1]
                    })
                }).catch(error => {
                    setError(error);
                })
                .finally(() => {
                    setLoading(false);
                });
            setEnteredText("");
        }
    }

    const getRDSOutput = async () => {
        const dummyQYery = "SELECT employee_dimension.emp_name FROM   sales_fact join employee_dimension on sales_fact.emp_id = employee_dimension.emp_id GROUP BY employee_dimension.emp_id, employee_dimension.emp_name ORDER BY sum(sales_fact.total) DESC LIMIT 1;"
        setopenai('');
        setLoading(true);
        setSubmittedText(enteredText); // Remove Dummy Query when 1st API is ready and uncomment line no 97.
        setRes(true);
        setError({});
        try{
            const query = await getRDSQuery(enteredText);
            setsales(query);
            console.log(query);
            const items = await getRDSQueryExplanation(query);
            setopenai(items);
            console.log(items);
        }catch(err){
            setError(err);
        }finally{
            setLoading(false);
        }
    }

    const submitHandler = (event) => {
        event.preventDefault();
        if(selectedDatabase === DATABASES.RDS){
            return getRDSOutput();
        }
        setopenai('');
        setLoading(true);
        setSubmittedText(null);
        

        const tempsetsub = ldmText + "\n Generate SQL query to " + enteredText + " as per Apache Presto syntax and please note below 2 points:-\n 1.prefix all column names with table alias.\n 2.if query is complex use CTE.";
        setSubmittedText(tempsetsub);
        console.log(tempsetsub);
        setRes(true);
        if (tempsetsub != null) {
            getOpenai(tempsetsub)
                .then(items => {
                    setopenai(items)
                }).catch(error => {
                    setError(error)
                })
                .finally(() => {
                    setLoading(false);
                });
        }

    };

    let listContent;

    if (res && loading) {
        listContent = <div ><Spinner /></div>;
    }
    else if (!loading && submittedText && openai.length != 0) {
        listContent = submittedText && openai && (
            <div className="center-container">
                <div className="input-schema">
                    <label htmlFor="name">Result</label>
                    <div className="content">
                        <table>
                            {/* <tr>
                                {
                                    Object.keys(openai.ResultSetMetadata.ColumnInfo).map(key =>
                                        console.log(key)
                                    )
                                }
                            </tr> */}
                            {openai && openai.Rows.map(item =>
                                <tr>
                                    {
                                        item.Data.map(data => <td>{data.VarCharValue}</td>)
                                    }
                                </tr>
                            )}
                        </table>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="name">Explanation: </label>
                    <div className="explanation-content">
                        {`${openai.content}`}
                    </div>
                </div>
            </div>

        )
    }
    else if (!loading && error) {
        listContent = (<div>
            <label htmlFor="name">Result</label>
            <div className="content"></div>{error.message}
        </div>);
    }

    const onSubmitOfEditQueryRes = () => {
        const ldm = localStorage.getItem("ldm");
        setLoading(true);
        // API call
        getQueryExecutionResult(getSqlQueryRes.query)
            .then(items => {
                setopenai(items)
            }).catch(error => {
                setError(error)
            })
            .finally(() => {
                setLoading(false);
            });
        // send getSqlQueryRes.query
    }

    const onDatabaseChange = (currentDb) => {
        setDatabase(currentDb);
        setopenai([])
        setGetSqlqueryRes({ query: '', explanation: '' });
        setLdmText('')
        setEnteredText('');
        setSubmittedText('')
        setRes(false);
        setLoading(true);
        setError({})
    }

    // useEffect(() => {
    //     getSales()
    //         .then(items => {
    //             setsales(items.data)
    //         });

    // }, [])


    return (
        <div className="Gpt">
            <div className="header">
                <img src="/sqlGPT.png" alt="logo" />
                <span>SqlGPT</span>
                <div className="selectDatabase">
                    <div>Select Database</div>
                    <select value={selectedDatabase}
                            onChange={(event) => onDatabaseChange(event.target.value)}>
                        <option value={DATABASES.ATHENA} defaultValue>AWS S3</option>
                        <option value={DATABASES.RDS}>RDS</option>
                    </select>
                </div>
            </div>
            <div className="up-container">
                <form onSubmit={submitHandler}>
                    <div className="fieldsGroup">
                    <div className="input-schema">
                        <label htmlFor="name" className='required-field'>Enter Schema Definition: </label>
                        <textarea className="input"
                            placeholder=""
                            type="text"
                            value={ldmText}
                            onChange={ldmHandler}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="name" className='required-field'>Enter Query: </label>
                        <textarea className="input"
                            placeholder=""
                            type="text"
                            value={enteredText}
                            onChange={textChangeHandler}
                        />
                    </div>
                    </div>
                    <div className='button-panel'>
                        {/* <button type="button" className="submit-btn" onClick={onQyeryHandler}>
                            Generate Query
                        </button> */}
                        <button type="submit" className="submit-btn">
                            SUBMIT
                        </button>
                    </div>
                </form>
            </div>

            {getSqlQueryRes.query ?
                (<div className='center-container'>
                    <div className='explanation-container'>
                        <p>Query with explanation</p>
                        <textarea className="input" placeholder="type something" onChange={(event) => {
                            setGetSqlqueryRes({
                                ...getSqlQueryRes,
                                query: event.target.value
                            })

                        }} value={getSqlQueryRes.query} />
                        <button type="button" className="submit-btn" onClick={onSubmitOfEditQueryRes}>Submit</button>
                        <div>
                            <>
                                {getSqlQueryRes.explanation}
                            </>
                        </div>
                    </div>
                </div>)
                : <></>
            }

            {console.log(openai)}
            {listContent}
        </div>
    );


}
export default Gpt;