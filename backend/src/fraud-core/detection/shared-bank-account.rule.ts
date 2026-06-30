import driver from "../../config/neo4j";

export async function sharedBankacountrule(accountnumber:string) {
    const session = driver.session()

    try{
        const result = await session.run(
            `MATCH (b:BankAccount{accountnumber:$accountnumber})
            <-[:OWNS_ACCOUNT]-(m)
            RETURN COUNT(m) as merchantcount`,
            {accountnumber}
        );
        const count = result.records[0].get("merchantcount").toNumber();
          return {
            triggered: count >= 2,
            score: count >= 50 ? 50 : 0,
            merchantCount: count
        };

    } finally {
        await session.close();
    }

}