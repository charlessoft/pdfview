import service from '@/utils/request'


export const analysepdf_byurl = (data) => {
    return service({
        url: '/analysepdf_byurl',
        method: 'post',
        data
    })
}

export const summaryParagraph = (data)=>{
    return service({
        url: '/summaryParagraph',
        method: 'post',
        data
    })
}
