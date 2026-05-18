/**
 * RailFreightSection 组件 - 中欧班列运费独立列
 */
function RailFreightSection({
    intlFreightOverseasUsd,
    setIntlFreightOverseasUsd,
    intlFreightDomesticUsd,
    setIntlFreightDomesticUsd,
    language = 'zh',
    t = (key) => key
}) {
    const h = React.createElement;
    const { Icon } = window;

    return h('div', { className: "bg-sky-50/60 p-4 rounded-2xl border border-sky-100 space-y-3 shadow-sm" },
        h('h4', { className: "text-sm font-bold text-sky-700 flex items-center gap-2 italic uppercase tracking-wider underline decoration-sky-200 decoration-2 underline-offset-4" },
            h(Icon, { name: 'TrainFront', size: 14 }),
            ` ${t('railFreightSection')}`
        ),
        h('div', { className: "space-y-3" },
            h('div', null,
                h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tighter" }, t('chinaEuropeFreightOverseas')),
                h('input', {
                    type: "number",
                    value: intlFreightOverseasUsd === 0 ? '' : intlFreightOverseasUsd,
                    onChange: e => {
                        const val = e.target.value;
                        setIntlFreightOverseasUsd(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none"
                })
            ),
            h('div', null,
                h('label', { className: "text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tighter" }, t('chinaEuropeFreightDomestic')),
                h('input', {
                    type: "number",
                    value: intlFreightDomesticUsd === 0 ? '' : intlFreightDomesticUsd,
                    onChange: e => {
                        const val = e.target.value;
                        setIntlFreightDomesticUsd(val === '' ? 0 : Number(val));
                    },
                    placeholder: "0",
                    className: "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-sky-100 focus:border-sky-300 outline-none"
                })
            ),
            h('p', { className: "text-[9px] text-sky-600 leading-snug" }, t('railFreightHint'))
        )
    );
}

if (typeof window !== 'undefined') {
    window.RailFreightSection = RailFreightSection;
}
