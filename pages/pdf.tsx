import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer'
import { useEffect, useState } from 'react'

Font.register({ family: 'Inter', src: '/assets/font.otf' })

const styles = StyleSheet.create({
  body: {
    paddingTop: 20,
    fontFamily: 'Inter'
  }
})

const PDF = () => {
  return (
        <Document>
            <Page style={styles.body}>
                <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <Text wrap={false} style={{ alignSelf: 'flex-end' }}>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nam delectus velit alias laudantium aperiam fugit non, quos exercitationem voluptatum tenetur deleniti, iure sint ducimus distinctio quas eum illum tempore molestias. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsa dolore totam quae nam repellendus! Pariatur dolores blanditiis ratione, temporibus, consequuntur non debitis laudantium asperiores molestias soluta quo? Cumque, alias et.
                    </Text>
                </View>
            </Page>
        </Document>
  )
}
const PDFView = () => {
  const [, setClient] = useState(false)

  useEffect(() => {
    setClient(true)
  }, [])

  return (
    <PDFViewer>
        <PDF/>
    </PDFViewer>
  )
}

export default PDFView
