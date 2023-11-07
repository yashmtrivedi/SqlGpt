import React, { useEffect, useState } from 'react';
import "./User.css";
import { getOpenai, openai } from '../services/openai'
import Spinner from '../Spinner/Spinner';
import { getSqlQuery } from '../services/getSqlQuery';
import { getQueryExecutionResult } from '../services/getQueryExecutionResult';

function query_between_strings(str) {
    const startStr = 'WITH';
    const endStr = "Explanation:";
    const regex_pattern = 'WITH';
    const alternate_pattern = 'SELECT';
    const alternate_pattern2 = ':(.*)';
    try {
        startStr = str.match(regex_pattern);
        console.log("match: " + startStr)
        if(startStr == null){
            startStr = str.match(alternate_pattern);
            console.log("match1: " + startStr)
        }

    } catch(error) {
        console.log(error)
    }

    
    const pos = str.indexOf(startStr);
    return (str.substring(pos, str.indexOf(endStr, pos))).replace('sql', '').replace('```', '');
}

function User() {
    const [sales, setsales] = useState([]);
    const [openai, setopenai] = useState([]);
    const [getSqlQueryRes, setGetSqlqueryRes] = useState({ query: '', explanation: '' });
    const [ldmText, setLdmText] = useState("");
    const [enteredText, setEnteredText] = useState("");
    const [submittedText, setSubmittedText] = useState(null);
    const [res, setRes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});


    const ldmHandler = (i) => {
        setLdmText(i.target.value);
    };

    const textChangeHandler = (i) => {
        setEnteredText(i.target.value);
    };

    const onQyeryHandler = (event) => {
        setopenai('');
        setLoading(true);
        const tempsetsub = enteredText;
        setSubmittedText(tempsetsub);
        setGetSqlqueryRes({});
        if (tempsetsub != null) {
            const ldm = localStorage.getItem("ldm");
            getSqlQuery(ldm + tempsetsub + " as per Apache Presto syntax and please note below 2 points:-\n 1.prefix all column names with table alias.\n 2.if query is complex use CTE.\n 3.please provide explanation of the query")
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

    const onSubmitOfEditQueryRes = () => {
        const ldm = localStorage.getItem("ldm");
        // API call
        setLoading(true);
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


    const submitHandler = (event) => {
        setopenai('');
        setLoading(true);
        event.preventDefault();
        setSubmittedText(null);
        const ldm = localStorage.getItem("ldm");
        const tempsetsub = ldm + "\n " + enteredText + " as per Apache Presto syntax and please note below 2 points:-\n 1.prefix all column names with table alias.\n 2.if query is complex use CTE.\n 3.please provide explanation of the query";
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
            setEnteredText("");
        }

    };

    let listContent;

    if (res && loading) {
        listContent = <div className="center-container"><Spinner /></div>;
    }
    else if (!loading && submittedText && openai.length !=0 ) {
        listContent = submittedText && openai && (
            <div className="center-container">
                <table>
                    <tr>
                        {
                            Object.keys(openai.ResultSetMetadata.ColumnInfo).map(key =>
                                console.log(key)
                            )
                        }
                    </tr>
                    {openai && openai.Rows.map(item =>
                        <tr>
                            {
                                item.Data.map(data => <td>{data.VarCharValue}</td>)
                            }
                        </tr>
                    )}
                </table>
            </div>

        )
    }
    else if (!loading && error) {
        listContent = <div>{error.message}</div>;
    }

    return (
        <div className="Gpt">
            <div className='up-container'>
                <h2>User PANEL</h2>
                <form onSubmit={submitHandler}>
                    <div className="input-group">
                        <label htmlFor="name">Enter your query</label>
                        <textarea className="input"
                            placeholder="type something"
                            type="text"
                            value={enteredText}
                            onChange={textChangeHandler}
                        />
                        <div className='button-panel'>
                            <button type="button" className="submit-btn" onClick={onQyeryHandler}>
                                Generate Query
                            </button>
                            <button type="submit" className="submit-btn">
                                Submit
                            </button>
                        </div>
                    </div>

                </form>
            </div>


            { getSqlQueryRes.query ? 
            (<div className='center-container'>
                <div className='explanation-container'>
                <p>Query with explanation</p>
                <textarea className="input" placeholder="type something" onChange={(event) => {
                    setGetSqlqueryRes({
                        ...getSqlQueryRes,
                        query: event.target.value
                    })

                }} value={getSqlQueryRes.query}/>
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
            
            {listContent}
        </div>
    );


}
export default User;