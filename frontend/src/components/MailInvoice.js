import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import Roboto from "../assets/fonts/Roboto-Regular.ttf"
import RobotoBold from "../assets/fonts/Roboto-Bold.ttf"


const MailInvoice = ({ order }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    <Text style={styles.title}>INVOICE</Text>
                    <View style={styles.top}>
                        <View>
                            <Text>Billing to:</Text>
                            <Text>{order["customer"]["name"]} {order["customer"]["surname"]}</Text>
                            <Text>{order["customer"]["email"]}</Text>
                            <Text>{order["address"]["detail"]}</Text>
                        </View>
                        <View>
                            <Text>Order #:</Text>
                            <Text>{order["orderNo"]}</Text>
                        </View>
                    </View>
                    <View style={styles.table}>
                        <Text style={styles.col1}>Product</Text>
                        <Text style={styles.col2}>Price</Text>
                        <Text style={styles.col2}>Quantity</Text>
                        <Text style={styles.col2}>Total</Text>
                    </View>
                    {order["products"].map((p) => {
                        return (
                            <View style={styles.row} key={p["name"]}>
                                <Text style={styles.col1}>{p["name"]}</Text>
                                <Text style={styles.col2}>${p["price"] * (100 - p.discount) / 100}</Text>
                                <Text style={styles.col2}>{p["qty"]}</Text>
                                <Text style={styles.col2}>${p["price"] * p["qty"] * (100 - p.discount) / 100}</Text>
                            </View>
                        );
                    })}
                    <View style={styles.bottom}>
                        <Text>Shipping: $9.99</Text>
                        <Text>Total: ${order["price"]}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

Font.register({
    family: "Roboto",
    fonts: [
        {
            src: Roboto
        },
        {
            src: RobotoBold,
            fontStyle: "bold"
        }
    ]
})

const styles = StyleSheet.create({
    page: {
        fontFamily: "Roboto",
        flexDirection: 'column',
        backgroundColor: '#E4E4E4',
        paddingTop: 100,
        paddingLeft: 50,
        paddingRight: 50
    },
    title: {
        fontWeight: 700,
        fontSize: 24,
        marginBottom: 20,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        fontSize: 16,
    },
    table: {
        backgroundColor: '#000',
        color: "#fff",
        flexDirection: 'row',
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        textAlign: 'center',
        fontStyle: 'bold',
    },
    row: {
        flexDirection: 'row',
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,

        textAlign: 'center',
    },
    col1: {
        width: '46%',
    },

    col2: {
        width: '18%',
        textAlign: 'center',
    },
    bottom: {
        textAlign: 'right',
        marginTop: 20,
        paddingTop: 10,
        fontSize: 16,
    },
});

export default MailInvoice