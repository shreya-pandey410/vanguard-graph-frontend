import driver from "../../config/neo4j";

export async function sharedDevicerule(deviceName:string) {
    const session = driver.session()

    try{
        const result = await session.run(
            `MATCH (d:DeviceName{devicename:$devicename})
            <-[:OWNS_device]-(m)
            RETURN COUNT(m) as merchantcount`,
            {deviceName}
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