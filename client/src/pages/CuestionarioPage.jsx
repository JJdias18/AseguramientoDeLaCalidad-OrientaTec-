import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import {
  getCurrentAttempt,
  startAttempt,
  saveAnswer,
  submitAttempt,
} from '../services/questionnaireService';
import { DIMENSIONES } from '../utils/riasec';
import Huella from '../components/Huella';
import EscalaRespuesta from '../components/EscalaRespuesta';

/** Fracción respondida por dimensión (para que la huella de progreso se forme). */
const fraccionesPorDimension = (questions, respuestas) => {
  const totales = {};
  const hechas = {};
  questions.forEach((question) => {
    totales[question.riasecType] = (totales[question.riasecType] || 0) + 1;
    if (respuestas[question.id] !== undefined) {
      hechas[question.riasecType] = (hechas[question.riasecType] || 0) + 1;
    }
  });
  return DIMENSIONES.reduce((acc, dimension) => {
    const total = totales[dimension.type] || 0;
    acc[dimension.type] = total ? (hechas[dimension.type] || 0) / total : 0;
    return acc;
  }, {});
};

const respuestasDesde = (answers) =>
  answers.reduce((acc, answer) => ({ ...acc, [answer.questionId]: answer.value }), {});

function CuestionarioPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | error | intro | question | submitting
  const [errorMsg, setErrorMsg] = useState('');
  const [state, setState] = useState(null); // { attempt, questions, answers, progress, resumed }
  const [respuestas, setRespuestas] = useState({});
  const [index, setIndex] = useState(0);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [pendientes, setPendientes] = useState([]);
  const preguntaRef = useRef(null);

  useEffect(() => {
    let activo = true;
    getCurrentAttempt(token)
      .then((data) => {
        if (!activo) return;
        if (data && data.attempt) {
          setState(data);
          setRespuestas(respuestasDesde(data.answers));
        }
        setStatus('intro');
      })
      .catch(() => activo && setStatus('error'));
    return () => {
      activo = false;
    };
  }, [token]);

  const questions = useMemo(() => state?.questions ?? [], [state]);
  const total = questions.length;
  const respondidas = Object.keys(respuestas).length;
  const completo = total > 0 && respondidas === total;
  const fracciones = useMemo(
    () => fraccionesPorDimension(questions, respuestas),
    [questions, respuestas]
  );

  const empezar = async () => {
    setErrorMsg('');
    try {
      const data = state?.attempt ? state : await startAttempt(token);
      setState(data);
      setRespuestas(respuestasDesde(data.answers));
      // Retomar desde la primera sin responder, sin salirse del rango de reactivos.
      setIndex(Math.min(data.progress.nextIndex, Math.max(data.questions.length - 1, 0)));
      setStatus('question');
    } catch (error) {
      setErrorMsg('No pudimos abrir el cuestionario. Intentá de nuevo.');
      setStatus('error');
    }
  };

  const responder = async (question, value) => {
    setRespuestas((prev) => ({ ...prev, [question.id]: value }));
    setPendientes([]);
    setSaveState('saving');
    try {
      await saveAnswer(token, state.attempt.id, question.id, value);
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
    }
  };

  const enviar = async () => {
    const faltantes = questions
      .map((question, posicion) => ({ id: question.id, posicion: posicion + 1 }))
      .filter((question) => respuestas[question.id] === undefined);

    if (faltantes.length > 0) {
      setPendientes(faltantes);
      setIndex(faltantes[0].posicion - 1);
      return;
    }

    setStatus('submitting');
    try {
      await submitAttempt(token, state.attempt.id);
      navigate('/mi-huella');
    } catch (error) {
      if (error.code === 'INCOMPLETE_QUESTIONNAIRE') {
        const posiciones = error.details?.missingPositions ?? [];
        setPendientes(posiciones.map((posicion) => ({ id: posicion, posicion })));
        setStatus('question');
        return;
      }
      setErrorMsg('No pudimos calcular tu huella. Tus respuestas están guardadas; probá de nuevo.');
      setStatus('question');
    }
  };

  if (status === 'loading') {
    return (
      <div className="pagina estrecha">
        <p className="sub">Cargando el cuestionario…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pagina estrecha">
        <div className="panel panel--error" role="alert">
          <b>Algo salió mal.</b> {errorMsg || 'No pudimos cargar el cuestionario.'}
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="pagina estrecha" aria-live="polite">
        <h1>Calculando tu huella…</h1>
        <div className="huella huella--vacia cargando" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <p className="sub">Estamos combinando tus respuestas en tu perfil vocacional.</p>
      </div>
    );
  }

  if (status === 'intro') {
    const retomando = Boolean(state?.resumed && respondidas > 0);
    return (
      <div className="pagina estrecha">
        <h1>Cuestionario vocacional</h1>
        <p className="sub" style={{ marginTop: 'var(--esp-3)' }}>
          Son <b>30 preguntas</b> y toma unos <b>8 minutos</b>. Respondé cada una en una escala del
          1 al 5 según cuánto te representa. Podés salir y retomar cuando querás: tu avance se
          guarda solo.
        </p>
        {retomando && (
          <div className="panel" role="status" style={{ margin: 'var(--esp-5) 0' }}>
            Retomaste donde quedaste:{' '}
            <b>
              pregunta {Math.min(respondidas + 1, total)} de {total}
            </b>
            .
          </div>
        )}
        <button
          type="button"
          className="btn btn--primario"
          onClick={empezar}
          style={{ marginTop: 'var(--esp-5)' }}
        >
          {retomando ? 'Retomar cuestionario' : 'Empezar'}
        </button>
      </div>
    );
  }

  // status === 'question'
  const question = questions[index];
  const numero = index + 1;

  return (
    <div className="pagina estrecha cuestionario">
      <Huella variant="progreso" fracciones={fracciones} />
      <p className="cuestionario__contador" aria-live="polite">
        Pregunta {numero} de {total}
      </p>

      {errorMsg && (
        <div className="panel panel--error" role="alert" style={{ marginBottom: 'var(--esp-4)' }}>
          {errorMsg}
        </div>
      )}

      {pendientes.length > 0 && (
        <div className="panel panel--error" role="alert" style={{ marginBottom: 'var(--esp-4)' }}>
          <b>Todavía faltan {pendientes.length} preguntas por responder.</b>
          <p style={{ margin: 'var(--esp-2) 0 0' }}>
            Pendientes:{' '}
            {pendientes.map((pendiente, i) => (
              <span key={pendiente.posicion}>
                <button
                  type="button"
                  className="enlace"
                  onClick={() => {
                    setIndex(pendiente.posicion - 1);
                    setPendientes([]);
                  }}
                >
                  {pendiente.posicion}
                </button>
                {i < pendientes.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}

      <fieldset className="cuestionario__pregunta" ref={preguntaRef}>
        <legend className="cuestionario__texto">{question.text}</legend>
        <EscalaRespuesta
          name={`pregunta-${question.id}`}
          value={respuestas[question.id]}
          onChange={(value) => responder(question, value)}
        />
      </fieldset>

      <p className="cuestionario__autosave sub" aria-live="polite">
        {saveState === 'saving' && 'Guardando…'}
        {saveState === 'saved' && 'Guardado ✓'}
        {saveState === 'error' && (
          <span className="mensaje">No se pudo guardar. Se reintenta al responder de nuevo.</span>
        )}
      </p>

      <div className="cuestionario__nav">
        <button
          type="button"
          className="enlace"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          ← Anterior
        </button>
        {index < total - 1 ? (
          <button
            type="button"
            className="btn btn--primario"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primario"
            onClick={enviar}
            aria-disabled={!completo}
          >
            Ver mi huella
          </button>
        )}
      </div>
    </div>
  );
}

export default CuestionarioPage;
