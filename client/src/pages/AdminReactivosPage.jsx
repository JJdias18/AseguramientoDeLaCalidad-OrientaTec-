import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import {
  createQuestion,
  deactivateQuestion,
  getQuestions,
  updateQuestion,
} from '../services/adminQuestionService';
import { DIMENSIONES, nombrePorTipo } from '../utils/riasec';

const FORM_VACIO = { id: null, text: '', riasecType: '' };

function AdminReactivosPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | error | listo
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(null); // null = formulario cerrado
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paraDesactivar, setParaDesactivar] = useState(null);
  const [toast, setToast] = useState(null);
  const dialogRef = useRef(null);

  const cargar = () => {
    setStatus('loading');
    getQuestions(token)
      .then((data) => {
        setQuestions(data.questions);
        setStatus('listo');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    cargar();
    // Solo al montar: cargar() se vuelve a invocar explícitamente tras cada acción.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (paraDesactivar) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [paraDesactivar]);

  const abrirCrear = () => {
    setForm({ ...FORM_VACIO });
    setErrors({});
  };

  const abrirEditar = (question) => {
    setForm({ id: question.id, text: question.text, riasecType: question.riasecType });
    setErrors({});
  };

  const cerrarFormulario = () => {
    setForm(null);
    setErrors({});
  };

  const validar = () => {
    const nextErrors = {};
    if (!form.text.trim()) {
      nextErrors.text = 'El texto del reactivo es obligatorio.';
    }
    if (!form.riasecType) {
      nextErrors.riasecType = 'Elegí un tipo RIASEC.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validar();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const datos = { text: form.text.trim(), riasecType: form.riasecType };
      if (form.id) {
        await updateQuestion(token, form.id, datos);
        setToast('Reactivo actualizado.');
      } else {
        await createQuestion(token, datos);
        setToast('Reactivo creado. Ya aparece en el cuestionario.');
      }
      cerrarFormulario();
      cargar();
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmarDesactivar = async () => {
    if (!paraDesactivar) return;
    try {
      await deactivateQuestion(token, paraDesactivar.id);
      setToast('Reactivo desactivado. Ya no aparece en el cuestionario.');
      setParaDesactivar(null);
      cargar();
    } catch (error) {
      setToast(error.message);
      setParaDesactivar(null);
    }
  };

  return (
    <div className="pagina">
      <h1>Banco de reactivos</h1>
      <p className="sub" style={{ marginTop: 'var(--esp-2)' }}>
        Los cambios se reflejan de inmediato en el cuestionario.
      </p>

      {!form && (
        <button
          type="button"
          className="btn btn--primario"
          style={{ marginTop: 'var(--esp-5)' }}
          onClick={abrirCrear}
        >
          Nuevo reactivo
        </button>
      )}

      {form && (
        <form onSubmit={handleSubmit} noValidate style={{ marginTop: 'var(--esp-5)' }}>
          <h2>{form.id ? 'Editar reactivo' : 'Nuevo reactivo'}</h2>

          <div className={`campo ${errors.text ? 'campo--error' : ''}`.trim()}>
            <label htmlFor="reactivo-texto">Texto del reactivo</label>
            <input
              id="reactivo-texto"
              type="text"
              value={form.text}
              onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
              aria-describedby={errors.text ? 'reactivo-texto-msg' : undefined}
            />
            {errors.text && (
              <p className="mensaje" id="reactivo-texto-msg">
                {errors.text}
              </p>
            )}
          </div>

          <div className={`campo ${errors.riasecType ? 'campo--error' : ''}`.trim()}>
            <label htmlFor="reactivo-tipo">Tipo RIASEC</label>
            <select
              id="reactivo-tipo"
              value={form.riasecType}
              onChange={(event) => setForm((prev) => ({ ...prev, riasecType: event.target.value }))}
              aria-describedby={errors.riasecType ? 'reactivo-tipo-msg' : undefined}
            >
              <option value="">Elegí un tipo…</option>
              {DIMENSIONES.map((dimension) => (
                <option key={dimension.type} value={dimension.type}>
                  {dimension.type} — {dimension.nombre}
                </option>
              ))}
            </select>
            {errors.riasecType && (
              <p className="mensaje" id="reactivo-tipo-msg">
                {errors.riasecType}
              </p>
            )}
          </div>

          {errors.form && (
            <div
              className="panel panel--error"
              role="alert"
              style={{ marginBottom: 'var(--esp-4)' }}
            >
              <b>{errors.form}</b>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--esp-3)' }}>
            <button
              className="btn btn--primario"
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? 'Guardando…' : 'Guardar'}
            </button>
            <button className="btn btn--secundario" type="button" onClick={cerrarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {status === 'loading' && (
        <p className="sub" style={{ marginTop: 'var(--esp-5)' }}>
          Cargando…
        </p>
      )}

      {status === 'error' && (
        <div className="panel panel--error" role="alert" style={{ marginTop: 'var(--esp-5)' }}>
          <b>No pudimos cargar el banco de reactivos.</b> Actualizá la página o intentá más tarde.
        </div>
      )}

      {status === 'listo' && (
        <table className="tabla-admin" style={{ marginTop: 'var(--esp-5)' }}>
          <thead>
            <tr>
              <th scope="col">Texto</th>
              <th scope="col">Tipo</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className={question.isActive ? '' : 'fila--inactiva'}>
                <td>{question.text}</td>
                <td data-col="Tipo">
                  <span
                    className={`carrera__punto t-${question.riasecType.toLowerCase()}`}
                    aria-hidden="true"
                  />{' '}
                  {question.riasecType} · {nombrePorTipo(question.riasecType)}
                </td>
                <td data-col="Estado">
                  {question.isActive ? (
                    <span className="chip-estado chip-estado--activo">Activo</span>
                  ) : (
                    <span className="chip-estado">Inactivo</span>
                  )}
                </td>
                <td className="tabla-admin__acciones">
                  <button type="button" onClick={() => abrirEditar(question)}>
                    Editar
                  </button>
                  {question.isActive && (
                    <button type="button" onClick={() => setParaDesactivar(question)}>
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby="modal-desactivar-titulo"
        onClose={() => setParaDesactivar(null)}
      >
        <h2 id="modal-desactivar-titulo">Desactivar reactivo</h2>
        <p>
          El reactivo deja de aparecer en el cuestionario de inmediato. Las respuestas ya
          registradas se conservan.
        </p>
        <div className="modal__acciones">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={() => setParaDesactivar(null)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn--peligro" onClick={confirmarDesactivar}>
            Sí, desactivar
          </button>
        </div>
      </dialog>

      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}

export default AdminReactivosPage;
